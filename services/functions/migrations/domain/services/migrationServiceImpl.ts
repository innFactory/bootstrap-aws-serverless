import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { MigrationService } from '../interfaces/migrationService';
import { inject, injectable } from 'inversify';
import { INJECTABLES } from '@common/injection/injectables';
import { MigrationRepository } from '../interfaces/migrationRepository';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { migrate } from '../common/migrate';
import { migrations } from './migrations';
import { errorResults } from '@common/results/errorResults';
import { Migration } from '../models/migration';

@injectable()
export class MigrationServiceImpl implements MigrationService {
	@inject(INJECTABLES.MigrationRepository)
	private migrationRepository!: MigrationRepository;

	triggerMigrations(context: InvocationContext): TaskResult<void> {
		return pipe(
			this.migrationRepository.getLatestInProgress(context),
			taskEither.bindTo('latestMigrationInProgress'),
			taskEither.bind('latestSuccessfulMigration', () =>
				this.migrationRepository.getLatestSuccessful(context)
			),
			taskEither.chain(
				({ latestMigrationInProgress, latestSuccessfulMigration }) =>
					migrate(
						{
							allMigrations: migrations,
							latestMigrationInProgress:
								latestMigrationInProgress,
							latestSuccessfulMigration:
								latestSuccessfulMigration,
							onMigrationProgress: (
								migration: Migration,
								context: InvocationContext
							) =>
								this.migrationRepository.upsert(
									migration,
									context
								),
						},
						context
					)
			),
			taskEither.chain((result) => {
				if (
					result.lastExecutedMigration === undefined ||
					result.lastExecutedMigration?.status === 'SUCCESS'
				) {
					return taskEither.right(void 0);
				} else {
					return taskEither.left(
						errorResults.internalServerError(
							'Some migrations failed'
						)
					);
				}
			})
		);
	}
}
