import { BankOutput } from '@api';
import { Config } from '@serverless-stack/node/config';
import { describe, expect, it } from 'vitest';
import { Api } from '../../smithy-codegen/build/smithyprojections/smithy-codegen/source/typescript-codegen/src';
import * as api from './utils/client/index';

describe('BankController', () => {
	// eslint-disable-next-line
	// @ts-ignore
	const url = Config.API_URL;
	//const client = new Api({ endpoint: url });
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

	//Fails with 415 because of: https://github.com/awslabs/smithy-typescript/issues/552
	it('should have bank in banks', async () => {
		const response = await client.listBanksRequest({});
		expect(response.data).toBeDefined();
		expect(
			(response.data.body ?? []).find(
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
