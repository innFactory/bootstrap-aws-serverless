import { TaskResult } from '@common/results/taskResult';
import { Bank, BankListOutput } from '../model/bank';
import { ListBanksInput } from '../model/listBanksInput';
import { InvocationContext } from '@common/gateway/model/invocationContext';

export interface BankRepository {
	create(bank: Bank, context: InvocationContext): TaskResult<Bank>;
	update(bank: Bank, context: InvocationContext): TaskResult<Bank>;
	get(bankId: string, context: InvocationContext): TaskResult<Bank>;
	list(
		input: ListBanksInput,
		context: InvocationContext
	): TaskResult<BankListOutput>;
	delete(bankId: string, context: InvocationContext): TaskResult<Bank>;
}
