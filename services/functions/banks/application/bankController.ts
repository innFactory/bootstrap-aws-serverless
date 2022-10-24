import { BaseController } from '@common/application/baseController';
import {
	BankOutput,
	CreateBankRequestServerInput,
	CreateBankRequestServerOutput,
	DeleteBankRequestServerInput,
	DeleteBankRequestServerOutput,
	GetBankInput,
	ListBanksRequestServerInput,
	ListBanksRequestServerOutput,
	UpdateBankRequestServerInput,
	UpdateBankRequestServerOutput,
	ValidationException,
} from '@api';
import { Operation } from '@aws-smithy/server-common';
import { HandlerContext } from '@common/apiGatewayHandler';
import { BankService } from '../domain/interfaces/bankService';
import { INJECTABLES } from '@common/injection/injectables';
import { lazyInject } from '@common/injection/decorator';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import {
	mapCreateBankInput,
	mapDeleteBankInput,
	mapGetBankInput,
	mapUpdateBankInput,
} from './mapper/banksMapper';

class BankController extends BaseController {
	@lazyInject(INJECTABLES.BankService) private bankService!: BankService;

	public list: Operation<
		ListBanksRequestServerInput,
		ListBanksRequestServerOutput,
		HandlerContext
	> = async (input, context) => {
		console.log(input, context);

		return pipe(this.bankService.list(), this.listToOutput, this.throwLeft);
	};

	public get: Operation<GetBankInput, BankOutput, HandlerContext> = async (
		input,
		context
	) => {
		console.log(input, context);

		return pipe(
			mapGetBankInput(input),
			taskEither.chain((id) => this.bankService.get(id)),
			this.throwLeft
		);
	};

	public create: Operation<
		CreateBankRequestServerInput,
		CreateBankRequestServerOutput,
		HandlerContext
	> = async (input, context) => {
		console.log(input, context);

		if (input.name) {
			return pipe(
				mapCreateBankInput(input),
				taskEither.chain((bank) => this.bankService.create(bank)),
				this.throwLeft
			);
		} else {
			throw new ValidationException({ message: '' });
		}
	};

	public update: Operation<
		UpdateBankRequestServerInput,
		UpdateBankRequestServerOutput,
		HandlerContext
	> = async (input, context) => {
		console.log(input, context);

		return pipe(
			mapUpdateBankInput(input),
			taskEither.chain((bank) => this.bankService.update(bank)),
			this.throwLeft
		);
	};

	public delete: Operation<
		DeleteBankRequestServerInput,
		DeleteBankRequestServerOutput,
		HandlerContext
	> = async (input, context) => {
		console.log(input, context);

		return pipe(
			mapDeleteBankInput(input),
			taskEither.chain((id) => this.bankService.delete(id)),
			this.throwLeft
		);
	};
}

export const bankController = new BankController();
