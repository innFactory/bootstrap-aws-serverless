import { TaskResult } from '@common/results/taskResult';
import { BankService } from '../interfaces/bankService';
import { inject, injectable } from 'inversify';
import { INJECTABLES } from '@common/injection/injectables';
import { BankRepository } from '../interfaces/bankRepository';
import { Bank, BankListOutput } from '../model/bank';
import { InvocationContextWithUser } from '@common/gateway/model/invocationContextWithUser';
import { ListBanksInput } from '../model/listBanksInput';

@injectable()
export class BankServiceImpl implements BankService {
	@inject(INJECTABLES.BankRepository)
	private bankRepository!: BankRepository;

	create(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank> {
		return this.bankRepository.create(bank, context);
	}
	update(bank: Bank, context: InvocationContextWithUser): TaskResult<Bank> {
		return this.bankRepository.update(bank, context);
	}
	get(bankId: string, context: InvocationContextWithUser): TaskResult<Bank> {
		return this.bankRepository.get(bankId, context);
	}
	list(
		input: ListBanksInput,
		context: InvocationContextWithUser
	): TaskResult<BankListOutput> {
		return this.bankRepository.list(input, context);
	}
	delete(
		bankId: string,
		context: InvocationContextWithUser
	): TaskResult<Bank> {
		return this.bankRepository.delete(bankId, context);
	}
}
