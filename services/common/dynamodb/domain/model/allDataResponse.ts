import { DynamoDB } from 'aws-sdk';

export interface AllDataResponse<T> {
	items: T[];
	lastEvaluatedKey: DynamoDB.Key | undefined;
}
