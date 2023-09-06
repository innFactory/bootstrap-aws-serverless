import { pipe } from 'fp-ts/lib/function';
import { Migration } from '../models/migration';
import { task, taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import { prettyPrint } from '@common/logging/prettyPrint';
import { TaskResult } from '@common/results/taskResult';
import { MigrationJob } from '../models/migrationJob';
import { formatISO } from 'date-fns';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { ErrorResult } from '@common/results/errorResult';
import * as _ from 'lodash';
import { isRight } from 'fp-ts/lib/Either';

export interface MigrationProps {
	allMigrations: MigrationJob[];
	latestMigrationInProgress: Migration | undefined;
	latestSuccessfulMigration: Migration | undefined;
	onMigrationProgress: (
		migration: Migration,
		context: InvocationContext
	) => TaskResult<void>;
}

interface MigrationsResult {
	/**
	 * Last migration that got executed.
	 * If it failed all following migrations marked as failed without execution
	 */
	lastExecutedMigration: Migration | undefined;
	/**
	 * Results of all migrations.
	 * A migration might be marked as failed without being executed. This happens if a previous migration failed
	 */
	migrationResults: Migration[];
}

interface MigrationsPartialResult {
	lastExecutedMigration: Migration;
	migrationResults: Migration[];
}

export const migrate = (props: MigrationProps, context: InvocationContext) => {
	return pipe(
		validateForMigrationInProgress(
			props.latestMigrationInProgress,
			context
		),
		taskEither.chain(() =>
			getNotYetExecuted(
				props.allMigrations,
				props.latestSuccessfulMigration?.id,
				context
			)
		),
		taskEither.bindTo('notYetExecuted'),
		taskEither.map(({ notYetExecuted }) => {
			context.logger.info(
				`Not yet executed migrations: ${
					notYetExecuted.length > 0
						? notYetExecuted.map((m) => m.id).join(', ')
						: '-'
				}`
			);
			const migrations = notYetExecuted
				.sort((a, b) => (a.id > b.id ? 1 : -1))
				.map((job) => {
					const migration: Migration = {
						id: job.id,
						startedAt: formatISO(new Date()),
						status: 'IN_PROGRESS',
						finishedAt: undefined,
					};
					return { migration, job: job.migration };
				});
			return migrations;
		}),
		taskEither.chain((migrations) =>
			runMigrationsSequentially(
				migrations,
				props.onMigrationProgress,
				context
			)
		)
	);
};

export const MIGRATION_ALREADY_IN_PROGRESS_MSG =
	'At least one migration is still running!';
const validateForMigrationInProgress = (
	migrationInProgress: Migration | undefined,
	context: InvocationContext
): TaskResult<void> => {
	if (migrationInProgress) {
		context.logger.info(MIGRATION_ALREADY_IN_PROGRESS_MSG);
		return taskEither.left(
			errorResults.conflict(MIGRATION_ALREADY_IN_PROGRESS_MSG)
		);
	} else {
		return taskEither.right(void 0);
	}
};

const runMigrationsSequentially = (
	migrations: {
		migration: Migration;
		job: (context: InvocationContext) => TaskResult<void>;
	}[],
	onMigrationProgress: (
		migration: Migration,
		context: InvocationContext
	) => TaskResult<void>,
	context: InvocationContext
): TaskResult<MigrationsResult> => {
	return migrations.reduce<TaskResult<MigrationsResult>>(
		(prevResults, migration) => {
			return pipe(
				prevResults,
				taskEither.chain(
					({ lastExecutedMigration, migrationResults }) => {
						if (
							lastExecutedMigration === undefined ||
							lastExecutedMigration.status === 'SUCCESS'
						) {
							return executeMigration(
								migration,
								migrationResults,
								onMigrationProgress,
								context
							);
						} else {
							return consecutivelyFailMigration(
								migration,
								lastExecutedMigration,
								migrationResults,
								onMigrationProgress,
								context
							);
						}
					}
				)
			);
		},
		taskEither.right({
			lastExecutedMigration: undefined,
			migrationResults: [],
		})
	);
};

const executeMigration = (
	migration: {
		migration: Migration;
		job: (context: InvocationContext) => TaskResult<void>;
	},
	migrationResults: Migration[],
	onMigrationProgress: (
		migration: Migration,
		context: InvocationContext
	) => TaskResult<void>,
	context: InvocationContext
): TaskResult<MigrationsPartialResult> => {
	context.logger.info(`Executing migration ${migration.migration.id}`);
	return pipe(
		onMigrationProgress(migration.migration, context),
		taskEither.chain(() =>
			taskEither.fromTask(
				pipe(
					taskEither.tryCatch(
						async () => {
							const result = await migration.job(context)();
							if (isRight(result)) {
								return result.right;
							} else {
								throw result.left;
							}
						},
						(error) => {
							const handledError = error as ErrorResult;
							if (
								handledError.statusCode !== undefined &&
								handledError.body !== undefined
							) {
								context.logger.warn(
									`Handled error while executing migration ${migration.migration.id}`,
									prettyPrint(error)
								);
								return handledError;
							} else {
								const msg = `Unhandled error while executing migration ${migration.migration.id}`;
								context.logger.warn(msg, prettyPrint(error));
								return errorResults.internalServerError(msg);
							}
						}
					),
					taskEither.match<ErrorResult, Migration, void>(
						() => ({
							...migration.migration,
							finishedAt: formatISO(new Date()),
							status: 'FAILED',
						}),
						() => ({
							...migration.migration,
							finishedAt: formatISO(new Date()),
							status: 'SUCCESS',
						})
					),
					task.map((migration) => ({
						lastExecutedMigration: migration,
						migrationResults: migrationResults.concat([migration]),
					}))
				)
			)
		),
		taskEither.chainFirst((result) => {
			context.logger.info(
				`Migration ${migration.migration.id} resolved with status ${result.lastExecutedMigration.status}`
			);
			return onMigrationProgress(result.lastExecutedMigration, context);
		})
	);
};

const consecutivelyFailMigration = (
	migration: {
		migration: Migration;
		job: (context: InvocationContext) => TaskResult<void>;
	},
	lastExecutedMigration: Migration,
	migrationResults: Migration[],
	onMigrationProgress: (
		migration: Migration,
		context: InvocationContext
	) => TaskResult<void>,
	context: InvocationContext
): TaskResult<MigrationsPartialResult> => {
	context.logger.info(
		`Consecutively fail migration ${migration.migration.id} because migration ${lastExecutedMigration.id} failed`
	);
	const processedMigration: Migration = {
		...migration.migration,
		finishedAt: formatISO(new Date()),
		status: 'FAILED',
	};
	return pipe(
		onMigrationProgress(processedMigration, context),
		taskEither.map(() => ({
			lastExecutedMigration: lastExecutedMigration,
			migrationResults: migrationResults.concat([processedMigration]),
		}))
	);
};

const getNotYetExecuted = (
	migrations: MigrationJob[],
	latestExecution: number | undefined,
	context: InvocationContext
): TaskResult<MigrationJob[]> => {
	return pipe(
		validateForDuplicates(migrations, context),
		taskEither.chain(() => {
			if (latestExecution) {
				return taskEither.right(
					migrations.filter(
						(migration) => migration.id > latestExecution
					)
				);
			} else {
				return taskEither.right(migrations);
			}
		})
	);
};

export const DUPLICATE_MIGRATION_IDS_MSG = 'Duplicate migration ids found!';
const validateForDuplicates = (
	migrations: MigrationJob[],
	context: InvocationContext
): TaskResult<void> => {
	const ids = migrations.map((migration) => migration.id);
	const uniqueIds = _.uniq(ids);
	if (uniqueIds.length !== ids.length) {
		context.logger.warn(
			DUPLICATE_MIGRATION_IDS_MSG,
			`ids: ${prettyPrint(ids)}`
		);
		return taskEither.left(
			errorResults.conflict(DUPLICATE_MIGRATION_IDS_MSG)
		);
	} else {
		return taskEither.right(void 0);
	}
};
