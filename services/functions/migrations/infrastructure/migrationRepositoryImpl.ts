import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { MigrationRepository } from '../domain/interfaces/migrationRepository';
import {
	Migration,
	MigrationDDB,
	MigrationDDBItem,
	MigrationStatus,
} from '../domain/models/migration';
import { inject, injectable } from 'inversify';
import { INJECTABLES } from '@common/injection/injectables';
import {
	DDBKey,
	DynamoDBRepository,
} from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { pipe } from 'fp-ts/lib/function';
import { TABLE_KEYS } from '@common/dynamodb/tableKeys';
import { mapMigrationToDDB } from './mapper/domainToDDB';
import { taskEither } from 'fp-ts';
import { mapMigrationDDBToDomain } from './mapper/ddbToDomain';

@injectable()
export class MigrationRepositoryImpl implements MigrationRepository {
	@inject(INJECTABLES.DynamoDBRepository)
	private dynamoDBRepository!: DynamoDBRepository<
		MigrationDDBItem,
		MigrationDDB
	>;

	private tableKey: string = TABLE_KEYS.MIGRATIONS_TABLE;

	upsert(migration: Migration, context: InvocationContext): TaskResult<void> {
		return pipe(
			this.dynamoDBRepository.upsert(
				{
					tableKey: this.tableKey,
					items: [mapMigrationToDDB(migration)],
				},
				context
			),
			taskEither.map(() => void 0)
		);
	}

	getLatestSuccessful(
		context: InvocationContext
	): TaskResult<Migration | undefined> {
		return pipe(
			this.dynamoDBRepository.get(
				{
					tableKey: this.tableKey,
					itemKeys: {
						status: new DDBKey<MigrationStatus>('SUCCESS'),
					},
					limit: 1,
					indexName: 'statusIndex',
					sortOrder: 'desc',
				},
				context
			),
			taskEither.map((result) =>
				result.items.length > 0
					? mapMigrationDDBToDomain(result.items[0])
					: undefined
			)
		);
	}

	getLatestInProgress(
		context: InvocationContext
	): TaskResult<Migration | undefined> {
		return pipe(
			this.dynamoDBRepository.get(
				{
					tableKey: this.tableKey,
					itemKeys: {
						status: new DDBKey<MigrationStatus>('IN_PROGRESS'),
					},
					limit: 1,
					indexName: 'statusIndex',
					sortOrder: 'desc',
				},
				context
			),
			taskEither.map((result) =>
				result.items.length > 0
					? mapMigrationDDBToDomain(result.items[0])
					: undefined
			)
		);
	}
}
