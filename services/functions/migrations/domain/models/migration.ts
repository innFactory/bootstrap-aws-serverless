import { DDBKey } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';

export type MigrationStatus = 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';

export interface Migration {
	id: number;
	status: MigrationStatus;
	startedAt: string;
	finishedAt: string | undefined;
}

export type MigrationDDB = Omit<Migration, ''>;
export type MigrationDDBItem = Omit<MigrationDDB, 'id' | 'status'> & {
	id: DDBKey<number>;
	status: DDBKey<MigrationStatus>;
};
