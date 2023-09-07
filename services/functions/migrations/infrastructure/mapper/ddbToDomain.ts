import {
	Migration,
	MigrationDDB,
} from '@functions/migrations/domain/models/migration';

export const mapMigrationDDBToDomain = (
	migration: MigrationDDB
): Migration => ({
	id: migration.id,
	status: migration.status,
	startedAt: migration.startedAt,
	finishedAt: migration.finishedAt,
});
