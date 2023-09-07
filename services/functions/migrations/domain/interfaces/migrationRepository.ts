import { InvocationContext } from '@common/gateway/model/invocationContext';
import { Migration } from '../models/migration';
import { TaskResult } from '@common/results/taskResult';

export interface MigrationRepository {
	upsert(migration: Migration, context: InvocationContext): TaskResult<void>;
	getLatestSuccessful(
		context: InvocationContext
	): TaskResult<Migration | undefined>;
	getLatestInProgress(
		context: InvocationContext
	): TaskResult<Migration | undefined>;
}
