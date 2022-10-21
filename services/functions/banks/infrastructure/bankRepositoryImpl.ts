import {
	CreateBankInput,
	Bank,
	UpdateBankInput,
	GetBankInput,
	DeleteBankInput,
} from '@api';
import { TaskResult } from '@common/results/taskResult';
import { BankRepository } from '../domain/interfaces/bankRepository';
import { injectable } from 'inversify';

@injectable()
export class BankRepositoryImpl implements BankRepository {
	create(bankInput: CreateBankInput): TaskResult<Bank> {
		throw new Error('Method not implemented.');
	}
	update(bankInput: UpdateBankInput): TaskResult<Bank> {
		throw new Error('Method not implemented.');
	}
	get(bankInput: GetBankInput): TaskResult<Bank> {
		throw new Error('Method not implemented.');
	}
	list(): TaskResult<Bank[]> {
		throw new Error('Method not implemented.');
	}
	delete(bankInput: DeleteBankInput): TaskResult<Bank> {
		throw new Error('Method not implemented.');
	}
}
