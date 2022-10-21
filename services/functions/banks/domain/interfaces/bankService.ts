import {
	Bank,
	CreateBankInput,
	DeleteBankInput,
	GetBankInput,
	UpdateBankInput,
} from '@api';
import { TaskResult } from '@common/results/taskResult';

export interface BankService {
	create(bankInput: CreateBankInput): TaskResult<Bank>;
	update(bankInput: UpdateBankInput): TaskResult<Bank>;
	get(bankInput: GetBankInput): TaskResult<Bank>;
	list(): TaskResult<Bank[]>;
	delete(bankInput: DeleteBankInput): TaskResult<Bank>;
}
