import { ErrorResult } from '@common/results/errorResult';
import { TaskResult } from '@common/results/taskResult';
import { extractEnv } from '@common/utils/extractEnv';
import { DynamoDB } from 'aws-sdk';
import { either, taskEither } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { BatchWriteItemInput, WriteRequest } from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';
import { errorResults } from '@common/results/errorResults';
import { PromiseResult } from 'aws-sdk/lib/request';
import { taskEitherExtended } from '@common/utils/taskEitherExtended';
import { injectable } from 'inversify';
import { Logger } from '@aws-lambda-powertools/logger';
import { prettyPrint } from '@common/logging/prettyPrint';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { traceTaskResult } from '@common/tracing/traceLifecycle';

@injectable()
export abstract class DynamoDBRepository {
	protected abstract tableKey: string;
	protected abstract logger: Logger;
	protected abstract tracer: Tracer;

	protected query = <T>(
		paramsCreator: (tableName: string) => DynamoDB.QueryInput,
		context: string
	): TaskResult<T[]> =>
		traceTaskResult(
			pipe(
				this.createQueryParams(paramsCreator),
				taskEitherExtended.chainAndMap(
					(params) =>
						taskEither.tryCatch(
							() => {
								this.logger.debug(
									`Query with params ${prettyPrint(params)}`
								);
								return this.ddb.query(params).promise();
							},
							(error) => {
								const msg = `[${context}] error querying aws with params ${prettyPrint(
									params
								)}: ${prettyPrint(error)}`;
								this.logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEither.chain((prevResults) =>
					this.processAwsResult<T>(
						prevResults.awsResult,
						context,
						prevResults.params
					)
				)
			),
			this.tracer
		);

	protected scan = <T>(
		paramsCreator: (tableName: string) => DynamoDB.ScanInput,
		context: string
	): TaskResult<T[]> =>
		traceTaskResult(
			pipe(
				this.createScanParams(paramsCreator),
				taskEitherExtended.chainAndMap(
					(params) =>
						taskEither.tryCatch(
							() => {
								this.logger.debug(
									`Scan with params ${prettyPrint(params)}`
								);
								return this.ddb.scan(params).promise();
							},
							(error) => {
								const msg = `[${context}] error scanning aws with params ${prettyPrint(
									params
								)}: ${prettyPrint(error)}`;
								this.logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEither.chain((prevResults) =>
					this.processAwsResult<T>(
						prevResults.awsResult,
						context,
						prevResults.params
					)
				)
			),
			this.tracer
		);

	upsertItems = <T>(items: T[], context: string): TaskResult<void> =>
		traceTaskResult(
			pipe(
				this.getTableName(),
				taskEither.chain((tableName) =>
					taskEither.fromEither(
						this.wrapInPutRequest(items, tableName)
					)
				),
				taskEither.chain(this.batchWrite(context)),
				taskEither.chain(this.processBatchWriteOutput(context)),
				taskEither.map(() => undefined)
			),
			this.tracer
		);

	protected updateItem = <T>(
		paramsCreator: (tableName: string) => DynamoDB.UpdateItemInput,
		context: string
	): TaskResult<T> =>
		traceTaskResult(
			pipe(
				this.createUpdateItemInput(paramsCreator),
				taskEitherExtended.chainAndMap(
					(params) =>
						taskEither.tryCatch(
							async () => {
								return await this.ddb
									.updateItem(params)
									.promise();
							},
							(e) => {
								const msg = `[${context}] update failed with error ${prettyPrint(
									e
								)}`;
								this.logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEither.chain((prevResults) => {
					const { awsResult, params } = prevResults;
					{
						if (awsResult.$response.error) {
							const msg = `[${context}] aws error updating ${prettyPrint(
								params
							)}: ${prettyPrint(awsResult.$response.error)}`;
							this.logger.error(msg);
							return taskEither.left(
								errorResults.internalServerError(msg)
							);
						} else {
							if (awsResult.Attributes) {
								return taskEither.right(
									DynamoDB.Converter.unmarshall(
										awsResult.Attributes
									) as T
								);
							} else {
								const msg = `[${context}] update had no output`;
								this.logger.debug(msg);
								return taskEither.left(
									errorResults.internalServerError(msg)
								);
							}
						}
					}
				})
			),
			this.tracer
		);

	protected deleteItems = <T>(keys: T[], context: string) =>
		traceTaskResult(
			pipe(
				this.getTableName(),
				taskEither.chain((tableName) =>
					taskEither.fromEither(
						this.wrapInDeleteRequest(keys, tableName)
					)
				),
				taskEither.chain(this.batchWrite(context)),
				taskEither.chain(this.processBatchWriteOutput(context)),
				taskEither.map(() => undefined)
			),
			this.tracer
		);

	protected getTableName = (): TaskResult<string> =>
		extractEnv(this.tableKey, `DynamoDBRepository`);

	protected createQueryParams = (
		paramsCreator: (tableName: string) => DynamoDB.QueryInput
	): TaskResult<DynamoDB.QueryInput> => this.tableNameMapper(paramsCreator);

	protected createUpdateItemInput = (
		paramsCreator: (tableName: string) => DynamoDB.UpdateItemInput
	): TaskResult<DynamoDB.UpdateItemInput> =>
		this.tableNameMapper(paramsCreator);

	protected createScanParams = (
		paramsCreator: (tableName: string) => DynamoDB.ScanInput
	): TaskResult<DynamoDB.ScanInput> => this.tableNameMapper(paramsCreator);

	private tableNameMapper = <T>(
		mapTo: (tableName: string) => T
	): TaskResult<T> => pipe(this.getTableName(), taskEither.map(mapTo));

	private createDynamoDb = (): DynamoDB => {
		AWS.config.update({ region: 'eu-central-1' });
		return new DynamoDB({ apiVersion: '2012-08-10' });
	};
	protected ddb: DynamoDB = this.createDynamoDb();

	private wrapRequestItems = (
		writeRequest: WriteRequest[],
		tableName: string
	): Either<ErrorResult, BatchWriteItemInput> => {
		if (writeRequest.length > 0) {
			return either.right({
				RequestItems: {
					[tableName]: writeRequest,
				},
			});
		} else {
			return either.left(
				errorResults.internalServerError(
					'error wrapping in request, no items'
				)
			);
		}
	};

	private wrapInPutRequest = <T>(
		items: T[],
		tableName: string
	): Either<ErrorResult, BatchWriteItemInput> =>
		this.wrapRequestItems(
			items.map<WriteRequest>((item) => ({
				PutRequest: {
					Item: DynamoDB.Converter.marshall(
						item as { [key: string]: unknown },
						{
							convertEmptyValues: false,
						}
					),
				},
			})),
			tableName
		);

	private wrapInDeleteRequest = <T>(
		keys: T[],
		tableName: string
	): Either<ErrorResult, BatchWriteItemInput> =>
		this.wrapRequestItems(
			keys.map<WriteRequest>((key) => ({
				DeleteRequest: {
					Key: DynamoDB.Converter.marshall(
						key as { [key: string]: unknown },
						{
							convertEmptyValues: false,
						}
					),
				},
			})),
			tableName
		);

	private batchWrite =
		(context: string) => (writeRequest: DynamoDB.BatchWriteItemInput) =>
			taskEither.tryCatch(
				async () => {
					this.logger.debug(
						`[${context}] batch writing ${prettyPrint(
							writeRequest
						)}`
					);
					return await this.ddb
						.batchWriteItem(writeRequest)
						.promise();
				},
				(error) => {
					const msg = `[${context}] error batch writing ${prettyPrint(
						error
					)}`;
					this.logger.error(msg);
					return errorResults.internalServerError(msg);
				}
			);

	private processBatchWriteOutput =
		(context: string) =>
		(
			result: PromiseResult<DynamoDB.BatchWriteItemOutput, AWS.AWSError>
		) => {
			if (result.$response.error) {
				const msg = `[${context}] aws error batch writing ${prettyPrint(
					result.$response.error
				)}`;
				this.logger.error(msg);
				return taskEither.left(errorResults.internalServerError(msg));
			} else {
				return taskEither.right(result.$response.data);
			}
		};

	private processAwsResult = <T>(
		awsResult: PromiseResult<
			DynamoDB.QueryOutput | DynamoDB.ScanOutput,
			AWS.AWSError
		>,
		context: string,
		params: DynamoDB.QueryInput | DynamoDB.ScanInput
	): TaskResult<T[]> => {
		if (awsResult.$response.error) {
			const msg = `[${context}] aws error querying with params ${prettyPrint(
				params
			)}: ${prettyPrint(awsResult.$response.error)}`;
			this.logger.error(msg);
			return taskEither.left(errorResults.internalServerError(msg));
		} else {
			return taskEither.right(
				(awsResult.Items ?? []).map(
					(attributes): T =>
						DynamoDB.Converter.unmarshall(attributes) as T
				)
			);
		}
	};
}