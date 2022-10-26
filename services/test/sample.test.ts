import { BankOutput } from '@api';
import { Config } from '@serverless-stack/node/config';
import { describe, expect, it } from 'vitest';
import { Api } from '../../smithy-codegen/build/smithyprojections/smithy-codegen/source/typescript-codegen/src';

describe('BankController', () => {
	// eslint-disable-next-line
	// @ts-ignore
	// const url = Config.API_URL;
	const client = new Api({
		endpoint:
			'https://s6akg43580.execute-api.eu-central-1.amazonaws.com/anderha',
	});
	let bank: BankOutput;

	it('should create bank', async () => {
		const response = await client.createBankRequest({
			name: 'Testname',
		});
		bank = response;

		expect(response.name).toBe('Testname');
	});

	it('should get bank', async () => {
		const response = await client.getBankRequest({
			id: bank.id ?? '',
		});

		expect(response.id).toBe(bank.id);
		expect(response.name).toBe(bank.name);
	});

	// Fails with 415 because of: https://github.com/awslabs/smithy-typescript/issues/552
	// it('should have bank in banks', async () => {
	// 	const response = await client.listBanksRequest({});

	// 	expect(response.body).toBeDefined();
	// 	expect(
	// 		(response.body ?? []).find(
	// 			(b) => b.id === bank.id && b.name === bank.name
	// 		)
	// 	).toBeDefined();
	// });

	it('should update bank', async () => {
		const response = await client.updateBankRequest({
			id: bank.id ?? '',
			name: 'Testname edited',
		});

		expect(response.id).toBe(bank.id);
		expect(response.name).toBe('Testname edited');
	});

	it('should delete bank', async () => {
		const response = await client.deleteBankRequest({
			id: bank.id ?? '',
		});

		expect(response.id).toBe(bank.id);
	});
});
