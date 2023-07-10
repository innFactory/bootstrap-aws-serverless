import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { inject, injectable } from 'inversify';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { INJECTABLES } from '@common/injection/injectables';
import { errorResults } from '@common/results/errorResults';
import { LoginAttemptsRepository } from '../domain/interfaces/loginAttemptsRepository';
import {
	DDBKey,
	DynamoDBRepository,
} from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { LoginAttemptDDB, LoginAttemptDDBItem } from './model/loginAttempts';
import { TABLE_KEYS } from '@common/dynamodb/tableKeys';

@injectable()
export class LoginAttemptsRepositoryImpl implements LoginAttemptsRepository {
	@inject(INJECTABLES.DynamoDBRepository)
	private dynamoDBRepository!: DynamoDBRepository<
		LoginAttemptDDBItem,
		LoginAttemptDDB
	>;
	private tableKey: string = TABLE_KEYS.LOGINATTEMPTS_TABLE;

	get(
		userId: string,
		context: InvocationContext
	): TaskResult<LoginAttemptDDB | undefined> {
		return pipe(
			this.dynamoDBRepository.get(
				{
					tableKey: this.tableKey,
					itemKeys: {
						userId: new DDBKey(userId),
					},
				},
				context
			),
			taskEither.chain((attempts) => {
				if (attempts.items.length === 0) {
					return taskEither.right(undefined);
				} else if (attempts.items.length === 1) {
					return taskEither.right(attempts.items[0]);
				}
				return taskEither.left(
					errorResults.internalServerError(
						'Multiple login attempts found'
					)
				);
			})
		);
	}
	update(
		loginAttempt: LoginAttemptDDB,
		attempts: number,
		context: InvocationContext
	): TaskResult<number> {
		return pipe(
			this.dynamoDBRepository.upsert(
				{
					tableKey: this.tableKey,
					items: [
						{
							attempts: attempts,
							userId: new DDBKey(loginAttempt.userId),
							createdAt: loginAttempt.createdAt,
							updatedAt: new Date().toISOString(),
						},
					],
				},
				context
			),
			taskEither.map(() => attempts)
		);
	}

	create(
		userId: string,
		context: InvocationContext
	): TaskResult<LoginAttemptDDB> {
		const loginAttempts: LoginAttemptDDB = {
			attempts: 0,
			userId: userId,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		return pipe(
			this.dynamoDBRepository.upsert(
				{
					tableKey: this.tableKey,
					items: [
						{
							...loginAttempts,
							userId: new DDBKey(loginAttempts.userId),
						},
					],
				},
				context
			),
			taskEither.map(() => loginAttempts)
		);
	}

	delete(userId: string, context: InvocationContext): TaskResult<void> {
		return pipe(
			this.dynamoDBRepository.delete(
				{
					tableKey: this.tableKey,
					itemsKeys: [
						{
							userId: new DDBKey(userId),
						},
					],
				},
				context
			)
		);
	}
}
