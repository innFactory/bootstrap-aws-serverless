import { BankRepository } from '../domain/interfaces/bankRepository';
import { inject, injectable } from 'inversify';
import { TaskResult } from '@common/results/taskResult';
import {
	Bank,
	BankDDB,
	BankDDBItem,
	BankListOutput,
} from '../domain/model/bank';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import {
	DDBKey,
	DynamoDBRepository,
} from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { TABLE_KEYS } from '@common/dynamodb/tableKeys';
import { InvocationContextWithUser } from '@common/gateway/model/invocationContextWithUser';
import { ListBanksInput } from '../domain/model/listBanksInput';
import { INJECTABLES } from '@common/injection/injectables';
import { mapBankDomainToDDB } from './mapper/mapBankDomainToDDB';
import { mapBankDDBToDomain } from './mapper/mapBankDDBToDomain';

@injectable()
export class BankRepositoryImpl implements BankRepository {
	@inject(INJECTABLES.DynamoDBRepository)
	private dynamoDBRepository!: DynamoDBRepository<BankDDBItem, BankDDB>;

	private tableKey: string = TABLE_KEYS.BANKS_TABLE;

	create(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank> {
		return pipe(
			this.dynamoDBRepository.upsert(
				{
					tableKey: this.tableKey,
					items: [mapBankDomainToDDB(bank)],
				},
				context
			),
			taskEither.map(() => bank)
		);
	}
	update(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank> {
		return pipe(
			this.get(bank.id, context),
			taskEither.chain(() =>
				this.dynamoDBRepository.upsert(
					{
						tableKey: this.tableKey,
						items: [mapBankDomainToDDB(bank)],
					},
					context
				)
			),
			taskEither.map(() => bank)
		);
	}
	get(bankId: string, context: InvocationContextWithUser): TaskResult<Bank> {
		return pipe(
			this.dynamoDBRepository.get(
				{
					tableKey: this.tableKey,
					itemKeys: {
						id: new DDBKey(bankId),
					},
				},
				context
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
		const queryAllOrOne = () => {
			if (input.queryAll) {
				return this.dynamoDBRepository.getAll(
					{
						tableKey: this.tableKey,
					},
					context
				);
			} else {
				return this.dynamoDBRepository.get(
					{
						tableKey: this.tableKey,
						limit: input.limit,
						cursor: input.lastEvaluatedKey,
					},
					context
				);
			}
		};

		return pipe(
			queryAllOrOne(),
			taskEither.map((banksDDB) => {
				const banksList: BankListOutput = {
					items: banksDDB.items.map(mapBankDDBToDomain),
					lastEvaluatedKey: banksDDB.lastEvaluatedKey,
				};
				return banksList;
			})
		);
	}

	delete(
		bankId: string,
		context: InvocationContextWithUser
	): TaskResult<Bank> {
		return pipe(
			this.get(bankId, context),
			taskEither.chainFirst(() =>
				this.dynamoDBRepository.delete(
					{
						tableKey: this.tableKey,
						itemsKeys: [{ id: new DDBKey(bankId) }],
					},
					context
				)
			)
		);
	}
}
