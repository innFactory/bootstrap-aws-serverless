import { InvocationContext } from '@common/gateway/model/invocationContext';
import { MigrationJob } from '../models/migrationJob';
import { exampleMigrator } from './migrations/ExampleMigrator';

export const migrations: MigrationJob[] = [
	{
		id: 1,
		migration: (context: InvocationContext) =>
			exampleMigrator.migrate(context),
	},
];
