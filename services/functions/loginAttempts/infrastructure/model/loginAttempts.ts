import { DDBKey } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';

export interface LoginAttemptDDB {
	userId: string;
	attempts: number;
	createdAt: string;
	updatedAt: string;
}

export type LoginAttemptDDBItem = Omit<LoginAttemptDDB, 'userId'> & {
	userId: DDBKey<string>;
};
