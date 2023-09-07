import { DDBKey } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import {
	Migration,
	MigrationDDBItem,
} from '@functions/migrations/domain/models/migration';

export const mapMigrationToDDB = (migration: Migration): MigrationDDBItem => ({
	id: new DDBKey(migration.id),
	startedAt: migration.startedAt,
	finishedAt: migration.finishedAt,
	status: new DDBKey(migration.status),
});
