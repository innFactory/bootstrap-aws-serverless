import { describe, expect, it } from 'vitest';
import { config } from '@sst-config';
import * as api from './utils/client/index';
import { bank1 } from './mockData/bankMock';
import { testHelper } from './utils/testHelper';
import { fail } from 'assert';

describe('BankController', () => {
	const url = config.API_URL;

	const client = api.DefaultApiFactory(undefined, url);

	it('should create bank', async () => {
		await testHelper.wrapAxios(async () => {
			const response = await client.createBankRequest({
				name: 'Testname',
			});
			expect(response.data.name).toBe('Testname');
		});
	});

	it('should get bank', async () => {
		await testHelper.wrapAxios(async () => {
			const response = await client.getBankRequest(bank1.id);

			expect(response.data.id).toBe(bank1.id);
			expect(response.data.name).toBe(bank1.name);
		});
	});

	it('should have bank in banks', async () => {
		await testHelper.wrapAxios(async () => {
			const response = await client.listBanksRequest(
				undefined,
				undefined,
				undefined
			);
			expect(response.data).toBeDefined();
			expect(
				(response.data.items ?? []).find(
					(b) => b.id === bank1.id && b.name === bank1.name
				)
			).toBeDefined();
		});
	});

	it('should update bank', async () => {
		await testHelper.wrapAxios(async () => {
			const newName = 'Bankname edited';
			const response = await client.updateBankRequest({
				id: bank1.id ?? '',
				name: newName,
			});
			expect(response.data.id).toBe(bank1.id);
			expect(response.data.name).toBe(newName);
		});
	});

	it('should delete bank', async () => {
		await testHelper.wrapAxios(async () => {
			const response = await client.deleteBankRequest(bank1.id ?? '');

			expect(response.data.id).toBe(bank1.id);
		});
	});

	it('should fail to delete not existing bank', async () => {
		await testHelper.wrapAxios(
			async () => {
				await client.deleteBankRequest('no-id');

				fail('should not be able to delete not existing bank');
			},
			(error) => {
				expect(error.response?.status).toBe(404);
			}
		);
	});
});
