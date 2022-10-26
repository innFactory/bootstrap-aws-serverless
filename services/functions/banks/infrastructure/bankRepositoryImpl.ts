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
import { buildTracer } from '@common/tracing/tracerFactory';

@injectable()
export class BankRepositoryImpl
	extends DynamoDBRepository
	implements BankRepository
{
	protected logger = buildLogger(BankRepositoryImpl.name);
	protected tracer = buildTracer(BankRepositoryImpl.name);
	protected tableKey = TABLE_KEYS.BANKS_TABLE;

	create(bank: Bank): TaskResult<Bank> {
		return pipe(
			this.upsertItems([bank], BankRepositoryImpl.name),
			taskEither.map(() => bank)
		);
	}
	update(bank: Bank): TaskResult<Bank> {
		return pipe(
			this.get(bank.id),
			taskEither.chain(() =>
				this.upsertItems([bank], BankRepositoryImpl.name)
			),
			taskEither.map(() => bank)
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
				BankRepositoryImpl.name
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
			BankRepositoryImpl.name
		);
	}
	delete(bankId: string): TaskResult<Bank> {
		return pipe(
			this.get(bankId),
			taskEither.chainFirst(() =>
				this.deleteItems([{ id: bankId }], BankRepositoryImpl.name)
			)
		);
	}
}
