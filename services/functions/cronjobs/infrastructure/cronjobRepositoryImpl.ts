import { inject, injectable } from 'inversify';
import { CronjobRepository } from '../domain/interfaces/cronjobRepository';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import {
	Cronjob,
	CronjobDDB,
	CronjobDDBItem,
	CronjobDetails,
	PaginatedCronjobs,
} from '../domain/models/cronjob';
import { INJECTABLES } from '@common/injection/injectables';
import {
	DDBKey,
	DynamoDBRepository,
} from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { TABLE_KEYS } from '@common/dynamodb/tableKeys';
import { mapCronjobToDDBItem } from './mapper/cronjobDomainToDDB';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { errorResults } from '@common/results/errorResults';
import { mapCronjobDDBToDomain } from './mapper/cronjobDDBToDomain';
import { DynamoDB } from 'aws-sdk';

@injectable()
export class CronjobRepositoryImpl implements CronjobRepository {
	@inject(INJECTABLES.DynamoDBRepository)
	private dynamoDBRepository!: DynamoDBRepository<CronjobDDBItem, CronjobDDB>;

	private tableKey: string = TABLE_KEYS.CRONJOBS_TABLE;

	upsert<
		CronjobId extends Cronjob<string, CronjobDetails>['id'],
		Details extends CronjobDetails
	>(
		cronjob: Cronjob<CronjobId, Details>,
		context: InvocationContext
	): TaskResult<Cronjob<CronjobId, Details>> {
		const mapped = mapCronjobToDDBItem(cronjob);
		return pipe(
			this.dynamoDBRepository.upsert(
				{ tableKey: this.tableKey, items: [mapped] },
				context
			),
			taskEither.map(() => cronjob)
		);
	}

	get<CronjobId extends string, Details extends CronjobDetails>(
		cronjobId: CronjobId,
		createdAt: string,
		context: InvocationContext
	): TaskResult<Cronjob<CronjobId, Details>> {
		return pipe(
			this.getOptional<CronjobId, Details>(cronjobId, createdAt, context),
			taskEither.chain((job) => {
				if (job) {
					return taskEither.right(job);
				} else {
					return taskEither.left(
						errorResults.notFound(
							`job for id ${cronjobId} and createdAt ${createdAt} not found`
						)
					);
				}
			})
		);
	}

	getOptional<CronjobId extends string, Details extends CronjobDetails>(
		cronjobId: CronjobId,
		createdAt: string,
		context: InvocationContext
	): TaskResult<Cronjob<CronjobId, Details> | undefined> {
		return pipe(
			this.dynamoDBRepository.get(
				{
					tableKey: this.tableKey,
					itemKeys: {
						createdAt: new DDBKey(createdAt),
						id: new DDBKey(cronjobId),
					},
				},
				context
			),
			taskEither.chain((result) => {
				if (result.items.length === 1) {
					return taskEither.right(
						mapCronjobDDBToDomain(result.items[0])
					);
				} else if (result.items.length === 0) {
					return taskEither.right(undefined);
				} else {
					return taskEither.left(
						errorResults.preconditionRequired(
							`Multiple cronjobs for id ${cronjobId} and createdAt ${createdAt}`
						)
					);
				}
			})
		);
	}

	list<CronjobId extends string, Details extends CronjobDetails>(
		cronjobId: CronjobId,
		queryAll: boolean | undefined,
		lastEvaluatedKey: string | undefined,
		limit: number | undefined,
		context: InvocationContext
	): TaskResult<PaginatedCronjobs<CronjobId, Details>> {
		return pipe(
			queryAll
				? this.dynamoDBRepository.getAll(
						{
							tableKey: this.tableKey,
							itemKeys: {
								id: new DDBKey(cronjobId),
							},
							sortOrder: 'desc',
						},
						context
				  )
				: this.dynamoDBRepository.get(
						{
							tableKey: this.tableKey,
							itemKeys: {
								id: new DDBKey(cronjobId),
							},
							limit: limit,
							cursor: lastEvaluatedKey
								? (JSON.parse(
										Buffer.from(
											lastEvaluatedKey,
											'base64'
										).toString('utf-8')
								  ) as DynamoDB.Key)
								: undefined,
							sortOrder: 'desc',
						},
						context
				  ),
			taskEither.map((result) => ({
				...result,
				items: result.items.map(
					mapCronjobDDBToDomain<CronjobId, Details>
				),
			}))
		);
	}
}
