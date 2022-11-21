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
} from '@api';
import { Operation } from '@aws-smithy/server-common';
import { BankService } from '../domain/interfaces/bankService';
import { INJECTABLES } from '@common/injection/injectables';
import { lazyInject } from '@common/injection/decorator';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import {
	mapCreateBankInput,
	mapDeleteBankInput,
	mapGetBankInput,
	mapListBankInput,
	mapUpdateBankInput,
} from './mapper/banksMapper';
import { prettyPrint } from '@common/logging/prettyPrint';
import { InvocationContextWithUser } from '@common/gateway/model/invocationContextWithUser';

class BankController extends BaseController {
	@lazyInject(INJECTABLES.BankService) private bankService!: BankService;

	public list: Operation<
		ListBanksRequestServerInput,
		ListBanksRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) => {
		const { logger } = context;
		logger.addContext(context);
		logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			mapListBankInput(input),
			taskEither.chain((banksInput) =>
				this.bankService.list(banksInput, context)
			),
			this.throwOnLeft(logger)
		);
	};

	public get: Operation<GetBankInput, BankOutput, InvocationContextWithUser> =
		async (input, context) => {
			const { logger } = context;
			logger.addContext(context);
			logger.logEventIfEnabled(prettyPrint(input));

			return pipe(
				mapGetBankInput(input),
				taskEither.chain((id) => this.bankService.get(id, context)),
				this.throwOnLeft(logger)
			);
		};

	public create: Operation<
		CreateBankRequestServerInput,
		CreateBankRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) => {
		const { logger } = context;
		logger.addContext(context);
		logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			mapCreateBankInput(input),
			taskEither.chain((bank) => this.bankService.create(bank, context)),
			this.throwOnLeft(logger)
		);
	};

	public update: Operation<
		UpdateBankRequestServerInput,
		UpdateBankRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) => {
		const { logger } = context;
		logger.addContext(context);
		logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			mapUpdateBankInput(input),
			taskEither.chain((bank) => this.bankService.update(bank, context)),
			this.throwOnLeft(logger)
		);
	};

	public delete: Operation<
		DeleteBankRequestServerInput,
		DeleteBankRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) => {
		const { logger } = context;
		logger.addContext(context);
		logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			mapDeleteBankInput(input),
			taskEither.chain((id) => this.bankService.delete(id, context)),
			this.throwOnLeft(logger)
		);
	};
}

export const bankController = new BankController();
