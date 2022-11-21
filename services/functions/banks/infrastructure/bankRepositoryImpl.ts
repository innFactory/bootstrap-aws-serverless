import { BankRepository } from '../domain/interfaces/bankRepository';
import { injectable } from 'inversify';
import { TaskResult } from '@common/results/taskResult';
import { Bank, BankListOutput } from '../domain/model/bank';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import { DynamoDBRepository } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { TABLE_KEYS } from '@common/dynamodb/tableKeys';
import { InvocationContextWithUser } from '@common/gateway/model/invocationContextWithUser';
import { ListBanksInput } from '../domain/model/listBanksInput';

@injectable()
export class BankRepositoryImpl
	extends DynamoDBRepository
	implements BankRepository
{
	protected tableKey = TABLE_KEYS.BANKS_TABLE;

	create(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank> {
		const { logger, tracer } = context;
		return pipe(
			this.upsertItems([bank], logger, tracer),
			taskEither.map(() => bank)
		);
	}
	update(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank> {
		const { logger, tracer } = context;

		return pipe(
			this.get(bank.id, context),
			taskEither.chain(() => this.upsertItems([bank], logger, tracer)),
			taskEither.map(() => bank)
		);
	}
	get(bankId: string, context: InvocationContextWithUser): TaskResult<Bank> {
		const { logger, tracer } = context;

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
				logger,
				tracer
			),
			taskEither.chain((banks) => {
				if (banks.items.length == 1) {
					return taskEither.right(banks.items[0]);
				} else if (banks.items.length == 0) {
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

	list(
		input: ListBanksInput,
		context: InvocationContextWithUser
	): TaskResult<BankListOutput> {
		const { logger, tracer } = context;

		console.log(input.limit);

		const queryAllOrOne = () => {
			if (input.queryAll) {
				return this.getAllScan<Bank>(
					(tableName) => ({
						TableName: tableName,
					}),
					[],
					logger,
					tracer
				);
			} else {
				return this.scan<Bank>(
					(tableName) => ({
						TableName: tableName,
						Limit: input.limit,
						ExclusiveStartKey: input.lastEvaluatedKey
							? input.lastEvaluatedKey
							: undefined,
					}),
					logger,
					tracer
				);
			}
		};

		return pipe(
			queryAllOrOne(),
			taskEither.map(
				(banks) =>
					<BankListOutput>{
						items: banks.items,
						lastEvaluatedKey: banks.lastEvaluatedKey
							? Buffer.from(
									JSON.stringify(banks.lastEvaluatedKey)
							  ).toString('base64')
							: undefined,
					}
			)
		);
	}

	delete(
		bankId: string,
		context: InvocationContextWithUser
	): TaskResult<Bank> {
		const { logger, tracer } = context;

		return pipe(
			this.get(bankId, context),
			taskEither.chainFirst(() =>
				this.deleteItems([{ id: bankId }], logger, tracer)
			)
		);
	}
}
