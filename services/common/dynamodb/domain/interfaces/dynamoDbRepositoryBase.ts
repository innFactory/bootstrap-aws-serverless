import { TaskResult } from '@common/results/taskResult';
import { extractEnv } from '@common/utils/extractEnv';
import { DynamoDB } from 'aws-sdk';
import { taskEither, array } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import {
	BatchGetItemOutput,
	BatchWriteItemInput,
	KeyList,
	WriteRequest,
	BatchGetRequestMap,
} from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';
import { errorResults } from '@common/results/errorResults';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Logger } from '@aws-lambda-powertools/logger';
import { prettyPrint } from '@common/logging/prettyPrint';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { traceTaskResult } from '@common/tracing/traceLifecycle';
import { AllDataResponse } from '../model/allDataResponse';
import { injectable } from 'inversify';

@injectable()
abstract class DynamoDBRepositoryBase {
	protected query = <T>(
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.QueryInput,
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> =>
		traceTaskResult(
			pipe(
				this.createQueryParams(tableKey, paramsCreator),
				taskEither.bindTo('params'),
				taskEither.bind('awsResult', ({ params }) =>
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
							logger.warn(msg);
							return errorResults.internalServerError(
								'error querying'
							);
						}
					)
				),
				taskEither.bind('items', ({ params, awsResult }) =>
					this.processAwsResult<T>(awsResult, logger, params)
				),
				taskEither.map(({ awsResult, items }) => ({
					items: items,
					lastEvaluatedKey: awsResult.$response.hasNextPage()
						? this.mapLastEvaluatedKey(awsResult.LastEvaluatedKey)
						: undefined,
				}))
			),
			tracer,
			DynamoDBRepositoryBase.name
		);

	protected batchGetItem = <T>(
		tableKey: string,
		input: KeyList,
		logger: Logger,
		tracer: Tracer
	): TaskResult<T[]> => {
		const chunkedInput = array.chunksOf(100)(input);
		return traceTaskResult(
			pipe(
				taskEither.right(
					chunkedInput.map((chunk) =>
						this.batchGetItemChunk<T>(
							tableKey,
							chunk,
							[],
							logger,
							tracer
						)
					)
				),
				taskEither.chain(taskEither.sequenceArray),
				taskEither.map((x) => x.flat())
			),
			tracer,
			DynamoDBRepositoryBase.name
		);
	};

	private batchGetItemChunk = <T>(
		tableKey: string,
		input: KeyList,
		items: T[],
		logger: Logger,
		tracer: Tracer
	): TaskResult<T[]> => {
		return pipe(
			this.createBatchGetItemParams(tableKey, (tableName) => ({
				RequestItems: {
					[tableName]: {
						Keys: input,
					},
				},
			})),
			taskEither.bindTo('params'),
			taskEither.bind('awsResult', ({ params }) =>
				taskEither.tryCatch(
					() => {
						logger.debug(
							`BatchGetItem with params ${prettyPrint(params)}`
						);
						return this.ddb.batchGetItem(params).promise();
					},
					(error) => {
						const msg = `error batch getting Item aws with params ${prettyPrint(
							params
						)}: ${prettyPrint(error)}`;
						logger.warn(
							`error batch getting Item: ${prettyPrint(error)}`
						);
						logger.debug(msg);
						return errorResults.internalServerError(
							'error batch getting'
						);
					}
				)
			),
			taskEither.bind('tableName', () => this.getTableName(tableKey)),
			taskEither.bind('response', ({ awsResult }) =>
				this.processBatchGetOutput(logger)(awsResult)
			),
			taskEither.chain(({ response, tableName }) => {
				const responseItems =
					response.Responses !== undefined
						? response.Responses[tableName].map(
								(attr) =>
									DynamoDB.Converter.unmarshall(attr) as T
						  )
						: [];
				if (Object.keys(response.UnprocessedKeys ?? []).length === 0) {
					return taskEither.right(responseItems);
				} else if (response.UnprocessedKeys !== undefined) {
					const unprocessedKeys: BatchGetRequestMap =
						response.UnprocessedKeys;
					return this.batchGetItemChunk<T>(
						tableKey,
						unprocessedKeys[tableName].Keys,
						responseItems,
						logger,
						tracer
					);
				} else {
					return taskEither.right(responseItems);
				}
			}),
			taskEither.chain((results) => {
				return taskEither.right([...items, ...results]);
			})
		);
	};

	protected getAllQuery = <T>(
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.QueryInput,
		allData: T[] = [],
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> => {
		return traceTaskResult(
			pipe(
				this.createQueryParams(tableKey, paramsCreator),
				taskEither.bindTo('params'),
				taskEither.bind('awsResult', ({ params }) =>
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
							logger.warn(msg);
							return errorResults.internalServerError(
								'error scanning'
							);
						}
					)
				),
				taskEither.bind('items', ({ params, awsResult }) =>
					this.processAwsResult<T>(awsResult, logger, params)
				),
				taskEither.chain(({ params, awsResult, items }) => {
					const newAllData: T[] = [...allData, ...items];
					if (awsResult.LastEvaluatedKey) {
						return this.getAllQuery<T>(
							tableKey,
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
			DynamoDBRepositoryBase.name
		);
	};

	protected getAllScan = <T>(
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.ScanInput,
		allData: T[] = [],
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> => {
		return traceTaskResult(
			pipe(
				this.createScanParams(tableKey, paramsCreator),
				taskEither.bindTo('params'),
				taskEither.bind('awsResult', ({ params }) =>
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
							logger.warn(msg);
							return errorResults.internalServerError(
								'error scanning'
							);
						}
					)
				),
				taskEither.bind('items', ({ params, awsResult }) =>
					this.processAwsResult<T>(awsResult, logger, params)
				),
				taskEither.chain(({ params, awsResult, items }) => {
					const newAllData: T[] = [...allData, ...items];
					if (awsResult.LastEvaluatedKey) {
						return this.getAllScan<T>(
							tableKey,
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
			DynamoDBRepositoryBase.name
		);
	};

	protected scan = <T>(
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.ScanInput,
		logger: Logger,
		tracer: Tracer
	): TaskResult<AllDataResponse<T>> => {
		return traceTaskResult(
			pipe(
				this.createScanParams(tableKey, paramsCreator),
				taskEither.bindTo('params'),
				taskEither.bind('awsResult', ({ params }) =>
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
							logger.warn(msg);
							return errorResults.internalServerError(
								'error scanning'
							);
						}
					)
				),
				taskEither.bind('items', (prevResults) =>
					this.processAwsResult<T>(
						prevResults.awsResult,
						logger,
						prevResults.params
					)
				),
				taskEither.map(({ awsResult, items }) => ({
					items: items,
					lastEvaluatedKey: awsResult.$response.hasNextPage()
						? this.mapLastEvaluatedKey(awsResult.LastEvaluatedKey)
						: undefined,
				}))
			),
			tracer,
			DynamoDBRepositoryBase.name
		);
	};

	upsertItems = <I>(
		tableKey: string,
		items: I[],
		logger: Logger,
		tracer: Tracer
	): TaskResult<void> =>
		traceTaskResult(
			pipe(
				this.getTableName(tableKey),
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
			DynamoDBRepositoryBase.name
		);

	protected updateItem = <T>(
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.UpdateItemInput,
		logger: Logger,
		tracer: Tracer
	): TaskResult<T> =>
		traceTaskResult(
			pipe(
				this.createUpdateItemInput(tableKey, paramsCreator),
				taskEither.bindTo('params'),
				taskEither.bind('awsResult', ({ params }) =>
					taskEither.tryCatch(
						async () => {
							return await this.ddb.updateItem(params).promise();
						},
						(e) => {
							const msg = `update failed with error ${prettyPrint(
								e
							)}`;
							logger.warn(msg);
							return errorResults.internalServerError(
								'update failed'
							);
						}
					)
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
									errorResults.internalServerError(
										'update failed, had no output'
									)
								);
							}
						}
					}
				})
			),
			tracer,
			DynamoDBRepositoryBase.name
		);

	protected deleteItems = <T>(
		tableKey: string,
		keys: T[],
		logger: Logger,
		tracer: Tracer
	) =>
		traceTaskResult(
			pipe(
				this.getTableName(tableKey),
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
			DynamoDBRepositoryBase.name
		);

	protected getTableName = (tableKey: string): TaskResult<string> =>
		extractEnv(tableKey, `DynamoDBRepositoryBase`);

	protected createQueryParams = (
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.QueryInput
	): TaskResult<DynamoDB.QueryInput> =>
		this.tableNameMapper(tableKey, paramsCreator);

	protected createUpdateItemInput = (
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.UpdateItemInput
	): TaskResult<DynamoDB.UpdateItemInput> =>
		this.tableNameMapper(tableKey, paramsCreator);

	protected createScanParams = (
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.ScanInput
	): TaskResult<DynamoDB.ScanInput> =>
		this.tableNameMapper(tableKey, paramsCreator);

	protected createBatchGetItemParams = (
		tableKey: string,
		paramsCreator: (tableName: string) => DynamoDB.BatchGetItemInput
	): TaskResult<DynamoDB.BatchGetItemInput> =>
		this.tableNameMapper(tableKey, paramsCreator);

	private tableNameMapper = <T>(
		tableKey: string,
		mapTo: (tableName: string) => T
	): TaskResult<T> =>
		pipe(this.getTableName(tableKey), taskEither.map(mapTo));

	private createDynamoDb = (): DynamoDB => {
		AWS.config.update({ region: 'eu-central-1' });
		return new DynamoDB({ apiVersion: '2012-08-10' });
	};
	protected ddb: DynamoDB = this.createDynamoDb();

	private wrapInPutRequest = <T>(
		items: T[],
		tableName: string
	): BatchWriteItemInput[] => {
		const chunkSize = 25;
		const chunked = array.chunksOf(chunkSize)(items);
		return chunked.map((chunk) => {
			return {
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
			};
		});
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
							this.ddb.batchWriteItem(writeRequest).promise()
						)
					);
				},
				(error) => {
					const msg = `error batch writing ${prettyPrint(error)}`;
					logger.warn(msg);
					return errorResults.internalServerError(
						'error batch writing'
					);
				}
			);

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

	private processBatchGetOutput =
		(logger: Logger) =>
		(
			result: PromiseResult<DynamoDB.BatchGetItemOutput, AWS.AWSError>
		): TaskResult<BatchGetItemOutput> => {
			if (result.$response.error) {
				const msg = `aws error batch writing ${prettyPrint(
					result.$response.error
				)}`;
				logger.error(msg);
				return taskEither.left(errorResults.internalServerError(msg));
			} else {
				return taskEither.right(result);
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

	private mapLastEvaluatedKey = (
		lastEvaluatedKey: DynamoDB.Key | undefined
	) =>
		lastEvaluatedKey
			? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64')
			: undefined;
}

export default DynamoDBRepositoryBase;
