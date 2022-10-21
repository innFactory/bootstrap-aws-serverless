import {
	CreateBankInput,
	Bank,
	UpdateBankInput,
	GetBankInput,
	DeleteBankInput,
} from '@api';
import { TaskResult } from '@common/results/taskResult';
import { BankService } from '../interfaces/bankService';
import { injectable } from 'inversify';
import { taskEither } from 'fp-ts';

@injectable()
export class BankServiceImpl implements BankService {
	create(bankInput: CreateBankInput): TaskResult<Bank> {
		throw new Error('Method not implemented.');
	}
	update(bankInput: UpdateBankInput): TaskResult<Bank> {
		throw new Error('Method not implemented.');
	}
	get(bankInput: GetBankInput): TaskResult<Bank> {
		return taskEither.right({
			id: '1',
			name: 'name',
		});
	}
	list(): TaskResult<Bank[]> {
		throw new Error('Method not implemented.');
	}
	delete(bankInput: DeleteBankInput): TaskResult<Bank> {
		throw new Error('Method not implemented.');
	}
}
