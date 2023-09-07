import { Logger } from '@aws-lambda-powertools/logger';
import { prettyPrint } from '@common/logging/prettyPrint';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { injectable } from 'inversify';
import { AllDataResponse } from '../domain/model/allDataResponse';
import DynamoDB, { AttributeValue } from 'aws-sdk/clients/dynamodb';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import {
	DDBKey,
	DDBKeys,
	DynamoDBRepository,
} from '../domain/interfaces/dynamoDbRepository';
import DynamoDBRepositoryBase from '../domain/interfaces/dynamoDbRepositoryBase';

@injectable()
export class DynamoDBRepositoryImpl
	extends DynamoDBRepositoryBase
	implements DynamoDBRepository<DDBKeys, unknown>
{
	get = (
		queryParams: {
			tableKey: string;
			itemKeys?: DDBKeys;
			indexName?: string | undefined;
			limit?: number;
			cursor?: DynamoDB.Key;
			sortOrder?: 'asc' | 'desc';
		},
		context: InvocationContext
	): TaskResult<AllDataResponse<unknown>> => {
		const { tableKey, itemKeys, indexName, limit, cursor } = queryParams;
		if (itemKeys) {
			return pipe(
				this.createKeyList(itemKeys, context.logger, true),
				taskEither.chain((expressionAttributeValues) =>
					this.query(
						tableKey,
						(tableName) => ({
							TableName: tableName,
							IndexName: indexName,
							KeyConditionExpression:
								this.createKeyConditionExpression(itemKeys),
							ExpressionAttributeNames:
								this.createExpressionAttributeNames(itemKeys),
							ExpressionAttributeValues:
								expressionAttributeValues,
							Limit: limit,
							ExclusiveStartKey: cursor,
							ScanIndexForward:
								queryParams.sortOrder === undefined
									? undefined
									: queryParams.sortOrder === 'asc'
									? true
									: false,
						}),
						context.logger,
						context.tracer
					)
				)
			);
		} else {
			return this.scan(
				tableKey,
				(tableName) => ({
					TableName: tableName,
					IndexName: indexName,
					Limit: limit,
					ExclusiveStartKey: cursor,
				}),
				context.logger,
				context.tracer
			);
		}
	};

	getMultiple = (
		queryParams: {
			itemsKeys: DDBKeys[];
			tableKey: string;
		},
		context: InvocationContext
	): TaskResult<unknown[]> => {
		const keys = queryParams.itemsKeys.map((itemKeys) =>
			this.createKeyList(itemKeys, context.logger)
		);

		return pipe(
			taskEither.sequenceArray(keys),
			taskEither.map((keyList) => {
				return [...keyList];
			}),
			taskEither.chain((keyList) =>
				this.batchGetItem(
					queryParams.tableKey,
					keyList,
					context.logger,
					context.tracer
				)
			)
		);
	};

	getAll = (
		queryParams: {
			tableKey: string;
			itemKeys?: DDBKeys;
			indexName?: string;
		},
		context: InvocationContext
	): TaskResult<AllDataResponse<unknown>> => {
		const { tableKey, itemKeys, indexName } = queryParams;
		if (itemKeys) {
			return pipe(
				this.createKeyList(itemKeys, context.logger, true),
				taskEither.chain((expressionAttributeValues) => {
					return this.getAllQuery(
						tableKey,
						(tableName) => ({
							TableName: tableName,
							IndexName: indexName,
							KeyConditionExpression:
								this.createKeyConditionExpression(itemKeys),
							ExpressionAttributeNames:
								this.createExpressionAttributeNames(itemKeys),
							ExpressionAttributeValues:
								expressionAttributeValues,
						}),
						undefined,
						context.logger,
						context.tracer
					);
				})
			);
		} else {
			return this.getAllScan(
				tableKey,
				(tableName) => ({
					TableName: tableName,
					IndexName: indexName,
				}),
				undefined,
				context.logger,
				context.tracer
			);
		}
	};

	upsert = (
		queryParams: {
			tableKey: string;
			items: DDBKeys[];
		},
		context: InvocationContext
	): TaskResult<void> => {
		const items = queryParams.items.map((item) =>
			Object.keys(item).reduce<{ [key: string]: unknown }>(
				(itemWithResolvedKeys, key) => {
					const next = { ...itemWithResolvedKeys };
					const value = item[key];

					if (value instanceof DDBKey) {
						next[key] = value.get();
						return next;
					} else {
						next[key] = value;
						return next;
					}
				},
				{}
			)
		);

		return this.upsertItems(
			queryParams.tableKey,
			items,
			context.logger,
			context.tracer
		);
	};

	delete = (
		queryParams: {
			tableKey: string;
			itemsKeys: DDBKeys[];
		},
		context: InvocationContext
	): TaskResult<void> => {
		const keys = queryParams.itemsKeys.map((key) =>
			Object.keys(key).reduce<{ [key: string]: unknown }>(
				(result, current) => {
					const value = key[current];
					const obj = { ...result };
					obj[current] = value.get();
					return obj;
				},
				{}
			)
		);

		return this.deleteItems(
			queryParams.tableKey,
			keys,
			context.logger,
			context.tracer
		);
	};

	private createKeyConditionExpression = (itemKeys: DDBKeys) => {
		return Object.keys(itemKeys)
			.map((key) => `#${key} = :${key}`)
			.join(' and ');
	};

	private createExpressionAttributeNames = (itemKeys: DDBKeys) => {
		return Object.keys(itemKeys).reduce<{ [key: string]: string }>(
			(expressionAttributeNames, key) => {
				const obj = { ...expressionAttributeNames };
				obj[`#${key}`] = key;
				return obj;
			},
			{}
		);
	};

	private createKeyList = (
		itemKeys: DDBKeys,
		logger: Logger,
		asExpressionAttributeValues?: boolean
	): TaskResult<{
		[key: string]: AttributeValue;
	}> => {
		return taskEither.tryCatch(
			async () =>
				Object.keys(itemKeys).reduce(
					(expressionAttributeNames, key) => {
						const value = itemKeys[key].get();
						const valueDDBObj = this.createDDBObject(
							value,
							key,
							asExpressionAttributeValues
						);
						const obj = {
							...expressionAttributeNames,
							...valueDDBObj,
						};

						return obj;
					},
					{}
				),
			(e) => {
				logger.warn(prettyPrint(e));
				return errorResults.internalServerError();
			}
		);
	};

	private createDDBObject<T>(
		value: T,
		key: string,
		asExpressionAttributeValues?: boolean
	): AttributeValue {
		const obj: { [key: string]: T } = {};
		obj[`${asExpressionAttributeValues ? ':' : ''}${key}`] = value;

		const marshalled = DynamoDB.Converter.marshall(
			obj as { [key: string]: T },
			{
				convertEmptyValues: false,
			}
		);

		return marshalled;
	}
}
