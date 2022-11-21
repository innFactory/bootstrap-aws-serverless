import { InvocationContextWithUser } from '@common/gateway/model/invocationContextWithUser';
import { TaskResult } from '@common/results/taskResult';
import { Bank, BankListOutput } from '../model/bank';
import { ListBanksInput } from '../model/listBanksInput';

export interface BankRepository {
	create(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank>;
	update(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank>;
	get(bankId: string, context: InvocationContextWithUser): TaskResult<Bank>;
	list(
		input: ListBanksInput,
		context: InvocationContextWithUser
	): TaskResult<BankListOutput>;
	delete(
		bankId: string,
		context: InvocationContextWithUser
	): TaskResult<Bank>;
}
