import { ErrorResult } from '@common/results/errorResult';
import { TaskResult } from '@common/results/taskResult';
import { extractEnv } from '@common/utils/extractEnv';
import { AWSError, DynamoDB } from 'aws-sdk';
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
import { AllDataResponse } from '../model/allDataResponse';

@injectable()
export abstract class DynamoDBRepository {
	protected abstract tableKey: string;

	protected query = <T>(
		paramsCreator: (tableName: string) => DynamoDB.QueryInput,
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> =>
		traceTaskResult(
			pipe(
				this.createQueryParams(paramsCreator),
				taskEitherExtended.chainAndMap(
					(params) =>
						taskEither.tryCatch(
							() => {
								logger.debug(
									`Query with params ${prettyPrint(params)}`
								);
								return this.ddb.query(params).promise();
							},
							(error) => {
								const msg = `error querying aws with params ${prettyPrint(
									params
								)}: ${prettyPrint(error)}`;
								logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEitherExtended.chainAndAutoMap(
					({ params, awsResult }) =>
						this.processAwsResult<T>(awsResult, logger, params),
					'items'
				),
				taskEither.map(({ awsResult, items }) => ({
					items: items,
					lastEvaluatedKey: awsResult.LastEvaluatedKey,
				}))
			),
			tracer,
			DynamoDBRepository.name
		);

	protected getAllQuery = <T>(
		paramsCreator: (tableName: string) => DynamoDB.QueryInput,
		allData: T[] = [],
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> => {
		return traceTaskResult(
			pipe(
				this.createQueryParams(paramsCreator),
				taskEitherExtended.chainAndMap(
					(params) =>
						taskEither.tryCatch(
							() => {
								logger.debug(
									`query with params ${prettyPrint(params)}`
								);
								return this.ddb.query(params).promise();
							},
							(error) => {
								const msg = `error scanning aws with params ${prettyPrint(
									params
								)}: ${prettyPrint(error)}`;
								logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEitherExtended.chainAndAutoMap(
					({ params, awsResult }) =>
						this.processAwsResult<T>(awsResult, logger, params),
					'items'
				),
				taskEither.chain(({ params, awsResult, items }) => {
					const newAllData = [...allData, ...items];
					if (awsResult.LastEvaluatedKey) {
						return this.getAllQuery<T>(
							() => ({
								...params,
								ExclusiveStartKey: awsResult.LastEvaluatedKey,
							}),
							newAllData,
							logger,
							tracer
						);
					}
					return taskEither.right({
						items: newAllData,
						lastEvaluatedKey: undefined,
					} as AllDataResponse<T>);
				})
			),
			tracer,
			DynamoDBRepository.name
		);
	};

	protected getAllScan = <T>(
		paramsCreator: (tableName: string) => DynamoDB.ScanInput,
		allData: T[] = [],
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> => {
		return traceTaskResult(
			pipe(
				this.createScanParams(paramsCreator),
				taskEitherExtended.chainAndMap(
					(params) =>
						taskEither.tryCatch(
							() => {
								logger.debug(
									`Scan with params ${prettyPrint(params)}`
								);
								return this.ddb.scan(params).promise();
							},
							(error) => {
								const msg = `error scanning aws with params ${prettyPrint(
									params
								)}: ${prettyPrint(error)}`;
								logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEitherExtended.chainAndAutoMap(
					({ params, awsResult }) =>
						this.processAwsResult<T>(awsResult, logger, params),
					'items'
				),
				taskEither.chain(({ params, awsResult, items }) => {
					const newAllData = [...allData, ...items];
					if (awsResult.LastEvaluatedKey) {
						return this.getAllScan<T>(
							() => ({
								...params,
								ExclusiveStartKey: awsResult.LastEvaluatedKey,
							}),
							newAllData,
							logger,
							tracer
						);
					}
					return taskEither.right({
						items: newAllData,
						lastEvaluatedKey: undefined,
					} as AllDataResponse<T>);
				})
			),
			tracer,
			DynamoDBRepository.name
		);
	};

	protected scan = <T>(
		paramsCreator: (tableName: string) => DynamoDB.ScanInput,
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> => {
		return traceTaskResult(
			pipe(
				this.createScanParams(paramsCreator),

				taskEitherExtended.chainAndMap(
					(params) =>
						taskEither.tryCatch(
							() => {
								logger.debug(
									`Scan with params ${prettyPrint(params)}`
								);
								return this.ddb.scan(params).promise();
							},
							(error) => {
								const msg = `error scanning aws with params ${prettyPrint(
									params
								)}: ${prettyPrint(error)}`;
								logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEitherExtended.chainAndAutoMap(
					(prevResults) =>
						this.processAwsResult<T>(
							prevResults.awsResult,
							logger,
							prevResults.params
						),
					'items'
				),
				taskEither.map(({ awsResult, items }) => ({
					items: items,
					lastEvaluatedKey: awsResult.LastEvaluatedKey,
				}))
			),
			tracer,
			DynamoDBRepository.name
		);
	};

	upsertItems = <I>(
		items: I[],
		logger: Logger,
		tracer: Tracer
	): TaskResult<void> =>
		traceTaskResult(
			pipe(
				this.getTableName(),
				taskEither.map((tableName) =>
					this.wrapInPutRequest(items, tableName)
				),
				taskEither.chain(this.batchWrite(logger)),
				taskEither.map((writeItemOutputs) =>
					writeItemOutputs.map((writeItemOutput) =>
						this.processBatchWriteOutput(logger)(writeItemOutput)
					)
				),
				taskEither.map(() => undefined)
			),
			tracer,
			DynamoDBRepository.name
		);

	protected updateItem = <T>(
		paramsCreator: (tableName: string) => DynamoDB.UpdateItemInput,
		logger: Logger,
		tracer: Tracer
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
								const msg = `update failed with error ${prettyPrint(
									e
								)}`;
								logger.error(msg);
								return errorResults.internalServerError(msg);
							}
						),
					(params, awsResult) => ({ params, awsResult })
				),
				taskEither.chain((prevResults) => {
					const { awsResult, params } = prevResults;
					{
						if (awsResult.$response.error) {
							const msg = `aws error updating ${prettyPrint(
								params
							)}: ${prettyPrint(awsResult.$response.error)}`;
							logger.error(msg);
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
								const msg = `update had no output`;
								logger.debug(msg);
								return taskEither.left(
									errorResults.internalServerError(msg)
								);
							}
						}
					}
				})
			),
			tracer,
			DynamoDBRepository.name
		);

	protected deleteItems = <T>(keys: T[], logger: Logger, tracer: Tracer) =>
		traceTaskResult(
			pipe(
				this.getTableName(),
				taskEither.map((tableName) =>
					this.wrapInDeleteRequest(keys, tableName)
				),
				taskEither.chain(this.batchWrite(logger)),
				taskEither.map((deleteItemOutputs) =>
					deleteItemOutputs.map((deleteItemOutput) =>
						this.processBatchWriteOutput(logger)(deleteItemOutput)
					)
				),
				taskEither.map(() => undefined)
			),
			tracer,
			DynamoDBRepository.name
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
	): BatchWriteItemInput[] => {
		const chunkSize = 25;
		const writeRequests = [];
		for (let i = 0; i < items.length; i += chunkSize) {
			const chunk = items.slice(i, i + chunkSize);
			writeRequests.push({
				RequestItems: {
					[tableName]: chunk.map<WriteRequest>((item) => ({
						PutRequest: {
							Item: DynamoDB.Converter.marshall(
								item as { [key: string]: unknown },
								{
									convertEmptyValues: false,
								}
							),
						},
					})),
				},
			});
		}
		return writeRequests;
	};

	private wrapInDeleteRequest = <T>(
		items: T[],
		tableName: string
	): BatchWriteItemInput[] => {
		const chunkSize = 25;
		const writeRequests = [];
		for (let i = 0; i < items.length; i += chunkSize) {
			const chunk = items.slice(i, i + chunkSize);
			writeRequests.push({
				RequestItems: {
					[tableName]: chunk.map<WriteRequest>((item) => ({
						DeleteRequest: {
							Key: DynamoDB.Converter.marshall(
								item as { [key: string]: unknown },
								{
									convertEmptyValues: false,
								}
							),
						},
					})),
				},
			});
		}
		return writeRequests;
	};

	private batchWrite =
		(logger: Logger) => (writeRequests: DynamoDB.BatchWriteItemInput[]) =>
			taskEither.tryCatch(
				async () => {
					logger.debug(`batch writing ${prettyPrint(writeRequests)}`);
					return await Promise.all(
						writeRequests.map(async (writeRequest) =>
							this.ddb
								.batchWriteItem(
									writeRequest,
									this.processItemsCallback(logger)
								)
								.promise()
						)
					);
				},
				(error) => {
					const msg = `error batch writing ${prettyPrint(error)}`;
					logger.error(msg);
					return errorResults.internalServerError(msg);
				}
			);

	private processItemsCallback =
		(logger: Logger) =>
		(err: AWSError, data: DynamoDB.BatchWriteItemOutput) => {
			if (err) {
				const msg = `error: ${prettyPrint(
					err
				)}, when recursively batch writing items: ${prettyPrint(
					data
				)} `;
				logger.error(msg);
			} else {
				const requestItems: BatchWriteItemInput = {
					RequestItems: data.UnprocessedItems ?? {},
				};
				if (Object.keys(requestItems.RequestItems).length != 0) {
					this.ddb.batchWriteItem(
						requestItems,
						this.processItemsCallback(logger)
					);
				}
			}
		};

	private processBatchWriteOutput =
		(logger: Logger) =>
		(
			result: PromiseResult<DynamoDB.BatchWriteItemOutput, AWS.AWSError>
		) => {
			if (result.$response.error) {
				const msg = `aws error batch writing ${prettyPrint(
					result.$response.error
				)}`;
				logger.error(msg);
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
		logger: Logger,
		params: DynamoDB.QueryInput | DynamoDB.ScanInput
	): TaskResult<T[]> => {
		if (awsResult.$response.error) {
			const msg = `aws error querying with params ${prettyPrint(
				params
			)}: ${prettyPrint(awsResult.$response.error)}`;
			logger.error(msg);
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
