import { Tracer } from '@aws-lambda-powertools/tracer';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { buildLogger } from '@common/logging/loggerFactory';
import { MetricExporter } from '@common/metrics/metricExporter';
import { errorResults } from '@common/results/errorResults';
import {
	DUPLICATE_MIGRATION_IDS_MSG,
	MIGRATION_ALREADY_IN_PROGRESS_MSG,
	migrate,
} from '@functions/migrations/domain/common/migrate';
import { MigrationJob } from '@functions/migrations/domain/models/migrationJob';
import { fail } from 'assert';
import { taskEither } from 'fp-ts';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { describe, expect, it } from 'vitest';

const successfulMigration = (id: number): MigrationJob => ({
	id: id,
	migration: () => taskEither.right(void 0),
});
const failedMigration = (id: number): MigrationJob => ({
	id: id,
	migration: () => taskEither.left(errorResults.internalServerError('')),
});

const onMigrationProgress = () => {
	return taskEither.right(void 0);
};

const context: InvocationContext = {
	awsRequestId: '',
	callbackWaitsForEmptyEventLoop: false,
	functionName: '',
	functionVersion: '',
	invokedFunctionArn: '',
	getRemainingTimeInMillis: () => 0,
	logGroupName: '',
	logStreamName: '',
	memoryLimitInMB: '',
	stage: 'test',
	logger: buildLogger('test'),
	metricExporter: new MetricExporter(),
	tracer: new Tracer(),
	done: () => void 0,
	fail: () => void 0,
	succeed: () => void 0,
};

describe('migration flow', () => {
	it('should migrate 2', async () => {
		const result = await migrate(
			{
				allMigrations: [successfulMigration(1), successfulMigration(2)],
				latestMigrationInProgress: undefined,
				latestSuccessfulMigration: undefined,
				onMigrationProgress: onMigrationProgress,
			},
			context
		)();
		if (isRight(result)) {
			expect(result.right.lastExecutedMigration?.id).toBe(2);
			expect(result.right.lastExecutedMigration?.status).toBe('SUCCESS');
			expect(result.right.migrationResults.length).toBe(2);
		} else {
			fail('Migration should not fail');
		}
	});

	it('should migrate only one because first one is already migrated', async () => {
		const result = await migrate(
			{
				allMigrations: [successfulMigration(1), successfulMigration(2)],
				latestMigrationInProgress: undefined,
				latestSuccessfulMigration: {
					id: 1,
					startedAt: '',
					finishedAt: '',
					status: 'SUCCESS',
				},
				onMigrationProgress: onMigrationProgress,
			},
			context
		)();
		if (isRight(result)) {
			expect(result.right.lastExecutedMigration?.id).toBe(2);
			expect(result.right.lastExecutedMigration?.status).toBe('SUCCESS');
			expect(result.right.migrationResults.length).toBe(1);
		} else {
			fail('Migration should not fail');
		}
	});

	it('should fail consecutive migrations', async () => {
		const result = await migrate(
			{
				allMigrations: [
					successfulMigration(1),
					failedMigration(2),
					successfulMigration(3),
				],
				latestMigrationInProgress: undefined,
				latestSuccessfulMigration: undefined,
				onMigrationProgress: onMigrationProgress,
			},
			context
		)();
		if (isRight(result)) {
			expect(result.right.lastExecutedMigration?.id).toBe(2);
			expect(result.right.lastExecutedMigration?.status).toBe('FAILED');
			expect(result.right.migrationResults.length).toBe(3);
			expect(result.right.migrationResults[0].id).toBe(1);
			expect(result.right.migrationResults[0].status).toBe('SUCCESS');
			expect(result.right.migrationResults[1].id).toBe(2);
			expect(result.right.migrationResults[1].status).toBe('FAILED');
			expect(result.right.migrationResults[2].id).toBe(3);
			expect(result.right.migrationResults[2].status).toBe('FAILED');
		} else {
			fail('Migration should not fail');
		}
	});

	it('should not migrate for duplicate ids', async () => {
		const result = await migrate(
			{
				allMigrations: [successfulMigration(1), successfulMigration(1)],
				latestMigrationInProgress: undefined,
				latestSuccessfulMigration: undefined,
				onMigrationProgress: onMigrationProgress,
			},
			context
		)();
		if (isLeft(result)) {
			expect(result.left.body.message).toBe(DUPLICATE_MIGRATION_IDS_MSG);
		} else {
			fail('Should fail because of duplicate ids');
		}
	});

	it('should not migrate if migrations are in progress', async () => {
		const result = await migrate(
			{
				allMigrations: [successfulMigration(1), successfulMigration(2)],
				latestMigrationInProgress: {
					id: 1,
					startedAt: '',
					status: 'IN_PROGRESS',
					finishedAt: undefined,
				},
				latestSuccessfulMigration: undefined,
				onMigrationProgress: onMigrationProgress,
			},
			context
		)();
		if (isLeft(result)) {
			expect(result.left.body.message).toBe(
				MIGRATION_ALREADY_IN_PROGRESS_MSG
			);
		} else {
			fail('Should fail because another migration is still running');
		}
	});
});
