import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';
import { injectable } from 'inversify';
import { dbMock } from 'services/test/mockData/dbMock';
import {
	DDBItem,
	DDBKey,
	DDBKeys,
	DynamoDBRepository,
} from '../domain/interfaces/dynamoDbRepository';
import { AllDataResponse } from '../domain/model/allDataResponse';
import * as _ from 'lodash';

@injectable()
export class DynamoDBRepositoryMock
	implements DynamoDBRepository<DDBItem, unknown>
{
	private mockToMap = () =>
		new Map<string, DDBItem[]>(
			Object.keys(dbMock).map((key) => [key, dbMock[key]])
		);
	private db = this.mockToMap();

	private reset = () => {
		this.db = this.mockToMap();
	};

	get = (
		queryParams: {
			tableKey: string;
			itemKeys?: DDBKeys;
			indexName?: string | undefined;
		},
		_context: InvocationContext // eslint-disable-line @typescript-eslint/no-unused-vars
	): TaskResult<AllDataResponse<unknown>> => {
		this.reset();
		return taskEither.right({
			items: this.filter(
				queryParams.tableKey,
				queryParams.itemKeys ?? {}
			),
			lastEvaluatedKey: undefined,
		});
	};

	getMultiple = (
		queryParams: { tableKey: string; itemsKeys: DDBKeys[] },
		_context: InvocationContext // eslint-disable-line @typescript-eslint/no-unused-vars
	): TaskResult<unknown[]> => {
		this.reset();
		const items = queryParams.itemsKeys
			.map((itemKeys) => this.filter(queryParams.tableKey, itemKeys))
			.flat();
		return taskEither.right(items);
	};

	getAll = (
		queryParams: {
			tableKey: string;
			itemKeys?: DDBKeys;
			indexName?: string | undefined;
		},
		_context: InvocationContext // eslint-disable-line @typescript-eslint/no-unused-vars
	): TaskResult<AllDataResponse<unknown>> => {
		this.reset();
		return taskEither.right({
			items: this.filter(
				queryParams.tableKey,
				queryParams.itemKeys ?? {}
			),
			lastEvaluatedKey: undefined,
		});
	};

	upsert = (
		queryParams: { tableKey: string; items: DDBItem[] },
		_context: InvocationContext // eslint-disable-line @typescript-eslint/no-unused-vars
	): TaskResult<void> => {
		this.reset();
		const items = this.db.get(queryParams.tableKey) ?? [];
		const itemsKeys = items.map(this.keysOfItem);

		const itemsToUpdate = itemsKeys
			.map((itemKeys) => this.filter(queryParams.tableKey, itemKeys))
			.flat();

		const updatedItems = itemsToUpdate.map((item) => {
			const updateFrom = queryParams.items.find((i) => {
				const itemKeys = this.keysOfItem(item);
				const iKeys = this.keysOfItem(i);

				return _.isEqual(itemKeys, iKeys);
			});

			if (updateFrom) {
				return {
					...item,
					...updateFrom,
				};
			} else {
				return item;
			}
		});

		const remainingItems = items.filter((i) => !itemsToUpdate.includes(i));

		this.db.set(queryParams.tableKey, [...remainingItems, ...updatedItems]);
		return taskEither.right(void 0);
	};

	delete = (
		queryParams: { tableKey: string; itemsKeys: DDBKeys[] },
		_context: InvocationContext // eslint-disable-line @typescript-eslint/no-unused-vars
	): TaskResult<void> => {
		this.reset();
		const items = this.db.get(queryParams.tableKey) ?? [];

		const itemsToDelete = queryParams.itemsKeys
			.map((itemKeys) => this.filter(queryParams.tableKey, itemKeys))
			.flat();

		const remainingItems = items.filter((i) => !itemsToDelete.includes(i));

		this.db.set(queryParams.tableKey, remainingItems);

		return taskEither.right(void 0);
	};

	private filter = (tableKey: string, itemKeys: DDBKeys) => {
		const items = this.db.get(tableKey);
		return (items ?? []).filter((item) =>
			Object.keys(itemKeys)
				.map((key) => item[key] === itemKeys[key].get())
				.reduce(
					(prevKeysMatched, curentKeyMatches) =>
						prevKeysMatched && curentKeyMatches,
					true
				)
		);
	};

	private keysOfItem = (item: DDBItem): DDBKeys => {
		return Object.keys(item).reduce<DDBKeys>((itemKeys, key) => {
			const obj = { ...itemKeys };
			const value = item[key];
			if (value instanceof DDBKey<unknown>) {
				obj[key] = value;
			}
			return obj;
		}, {});
	};
}
