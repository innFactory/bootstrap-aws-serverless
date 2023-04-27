import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { DynamoDB } from 'aws-sdk';
import { AllDataResponse } from '../model/allDataResponse';

export class DDBKey<T> {
	private value: T;
	constructor(value: T) {
		this.value = value;
	}

	get = () => this.value;
}

export type DDBKeys = { [key: string]: DDBKey<unknown> };
export type DDBValues = { [key: string]: unknown };
export type DDBItem = DDBKeys | DDBValues;

export interface DynamoDBRepository<ItemType extends DDBItem, ReturnType> {
	get: (
		queryParams: {
			tableKey: string;
			itemKeys?: DDBKeys;
			indexName?: string;
			limit?: number;
			cursor?: DynamoDB.Key;
		},
		context: InvocationContext
	) => TaskResult<AllDataResponse<ReturnType>>;

	getMultiple: (
		queryParams: {
			tableKey: string;
			itemsKeys: DDBKeys[];
		},
		context: InvocationContext
	) => TaskResult<ReturnType[]>;

	getAll: (
		queryParams: {
			tableKey: string;
			itemKeys?: DDBKeys;
			indexName?: string;
		},
		context: InvocationContext
	) => TaskResult<AllDataResponse<ReturnType>>;

	upsert: (
		queryParams: {
			tableKey: string;
			items: ItemType[];
		},
		context: InvocationContext
	) => TaskResult<void>;

	delete: (
		queryParams: {
			tableKey: string;
			itemsKeys: DDBKeys[];
		},
		context: InvocationContext
	) => TaskResult<void>;
}
