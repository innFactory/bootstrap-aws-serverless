import { LambdaBase } from '@common/LambdaBase';
import {
	Bank,
	CreateBankRequestServerInput,
	CreateBankRequestServerOutput,
	DeleteBankRequestServerInput,
	DeleteBankRequestServerOutput,
	GetBankInput,
	ListBanksRequestServerInput,
	ListBanksRequestServerOutput,
	UpdateBankRequestServerInput,
	UpdateBankRequestServerOutput,
} from '@api';
import { Operation } from '@aws-smithy/server-common';
import { HandlerContext } from '@common/apiGatewayHandler';
import { BankService } from '../domain/interfaces/bankService';
import { INJECTABLES } from '@common/injection/injectables';
import { lazyInject } from '@common/injection/decorator';

class BankController extends LambdaBase {
	@lazyInject(INJECTABLES.BankService) private bankService!: BankService;

	public list: Operation<
		ListBanksRequestServerInput,
		ListBanksRequestServerOutput,
		HandlerContext
	> = async (input, context) => {
		console.log(input, context);

		return {
			body: [],
		};
	};

	public get: Operation<GetBankInput, Bank, HandlerContext> = async (
		input,
		context
	) => {
		console.log(input, context);

		this.bankService.get(input);

		return {
			id: '1',
			name: 'name',
		};
	};

	public create: Operation<
		CreateBankRequestServerInput,
		CreateBankRequestServerOutput,
		HandlerContext
	> = async () => {
		return {
			id: '',
			name: '',
		};
	};

	public update: Operation<
		UpdateBankRequestServerInput,
		UpdateBankRequestServerOutput,
		HandlerContext
	> = async () => {
		return {
			id: '',
			name: '',
		};
	};

	public delete: Operation<
		DeleteBankRequestServerInput,
		DeleteBankRequestServerOutput,
		HandlerContext
	> = async () => {
		return {
			id: '',
			name: '',
		};
	};
}

export const bankController = new BankController();
