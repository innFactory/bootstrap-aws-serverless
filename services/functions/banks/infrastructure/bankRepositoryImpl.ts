import { BankRepository } from '../domain/interfaces/bankRepository';
import { injectable } from 'inversify';
import { TaskResult } from '@common/results/taskResult';
import { Bank } from '../domain/model/bank';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import { DynamoDBRepository } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { TABLE_KEYS } from '@common/dynamodb/tableKeys';
import { buildLogger } from '@common/logging/loggerFactory';

@injectable()
export class BankRepositoryImpl
	extends DynamoDBRepository
	implements BankRepository
{
	protected logger = buildLogger(BankRepositoryImpl.name);
	protected tableKey = TABLE_KEYS.BANKS_TABLE;
	private context = 'BanksRepsitory';

	create(bank: Bank): TaskResult<Bank> {
		return pipe(
			this.upsertItems([bank], this.context),
			taskEither.map(() => bank)
		);
	}
	update(bank: Bank): TaskResult<Bank> {
		return pipe(
			this.get(bank.id),
			taskEither.chainFirst(() => this.upsertItems([bank], this.context))
		);
	}
	get(bankId: string): TaskResult<Bank> {
		return pipe(
			this.query<Bank>(
				(tableName) => ({
					TableName: tableName,
					KeyConditionExpression: '#id = :id',
					ExpressionAttributeNames: {
						'#id': 'id',
					},
					ExpressionAttributeValues: {
						':id': {
							S: bankId,
						},
					},
				}),
				this.context
			),
			taskEither.chain((banks) => {
				if (banks.length == 1) {
					return taskEither.right(banks[0]);
				} else if (banks.length == 0) {
					return taskEither.left(
						errorResults.notFound(
							`bank with id ${bankId} not found`
						)
					);
				} else {
					return taskEither.left(
						errorResults.internalServerError(
							`duplicate bank for id ${bankId}`
						)
					);
				}
			})
		);
	}
	list(): TaskResult<Bank[]> {
		return this.scan<Bank>(
			(tableName) => ({
				TableName: tableName,
			}),
			this.context
		);
	}
	delete(bankId: string): TaskResult<Bank> {
		return pipe(
			this.get(bankId),
			taskEither.chainFirst(() =>
				this.deleteItems([{ bankId: bankId }], this.context)
			)
		);
	}
}
