import { TaskResult } from '@common/results/taskResult';
import { BankService } from '../interfaces/bankService';
import { inject, injectable } from 'inversify';
import { INJECTABLES } from '@common/injection/injectables';
import { BankRepository } from '../interfaces/bankRepository';
import { Bank } from '../model/bank';

@injectable()
export class BankServiceImpl implements BankService {
	@inject(INJECTABLES.BankRepository)
	private bankRepository!: BankRepository;

	create(bank: Bank): TaskResult<Bank> {
		return this.bankRepository.create(bank);
	}
	update(bank: Bank): TaskResult<Bank> {
		return this.bankRepository.update(bank);
	}
	get(bankId: string): TaskResult<Bank> {
		return this.bankRepository.get(bankId);
	}
	list(): TaskResult<Bank[]> {
		return this.bankRepository.list();
	}
	delete(bankId: string): TaskResult<Bank> {
		return this.bankRepository.delete(bankId);
	}
}
