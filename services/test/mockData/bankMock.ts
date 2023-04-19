import { BankDDB } from '@functions/banks/domain/model/bank';

export const bank1: BankDDB = {
	id: 'bank1-id',
	name: 'Bank 1',
};

export const bank2: BankDDB = {
	id: 'bank2-id',
	name: 'Bank 2',
};

export const banksMock: BankDDB[] = [bank1, bank2];
