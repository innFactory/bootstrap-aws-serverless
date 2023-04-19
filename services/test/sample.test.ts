import { BankOutput } from '@api';
import { describe, expect, it } from 'vitest';
import { config } from '@sst-config';
import * as api from './utils/client/index';

describe('BankController', () => {
	const url = config.API_URL;
	let bank: BankOutput;

	const client = api.DefaultApiFactory(undefined, url);

	it('should create bank', async () => {
		const response = await client.createBankRequest({
			name: 'Testname',
		});
		bank = response.data;

		expect(response.data.name).toBe('Testname');
	});

	it('should get bank', async () => {
		const response = await client.getBankRequest(bank.id ?? '');

		expect(response.data.id).toBe(bank.id);
		expect(response.data.name).toBe(bank.name);
	});

	it('should have bank in banks', async () => {
		const response = await client.listBanksRequest(
			undefined,
			undefined,
			undefined
		);
		expect(response.data).toBeDefined();
		expect(
			(response.data.items ?? []).find(
				(b) => b.id === bank.id && b.name === bank.name
			)
		).toBeDefined();
	});

	it('should update bank', async () => {
		const response = await client.updateBankRequest({
			id: bank.id ?? '',
			name: 'Testname edited',
		});

		expect(response.data.id).toBe(bank.id);
		expect(response.data.name).toBe('Testname edited');
	});

	it('should delete bank', async () => {
		const response = await client.deleteBankRequest(bank.id ?? '');

		expect(response.data.id).toBe(bank.id);
	});
});
