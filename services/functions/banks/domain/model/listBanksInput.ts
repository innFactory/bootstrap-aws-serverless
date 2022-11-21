import { DynamoDB } from 'aws-sdk';

export interface ListBanksInput {
	queryAll?: boolean;
	limit?: number;
	lastEvaluatedKey?: DynamoDB.Key;
}
