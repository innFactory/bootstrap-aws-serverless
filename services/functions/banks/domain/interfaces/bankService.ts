import { TaskResult } from '@common/results/taskResult';
import { Bank } from '../model/bank';

export interface BankService {
	create(bank: Bank): TaskResult<Bank>;
	update(bank: Bank): TaskResult<Bank>;
	get(bankId: string): TaskResult<Bank>;
	list(): TaskResult<Bank[]>;
	delete(bankId: string): TaskResult<Bank>;
}
