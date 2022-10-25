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
	mapUpdateBankInput,
} from './mapper/banksMapper';
import { Context } from 'aws-lambda';
import { buildLogger } from '@common/logging/loggerFactory';
import { prettyPrint } from '@common/logging/prettyPrint';
import { buildTracer } from '@common/tracing/tracerFactory';

class BankController extends BaseController {
	protected logger = buildLogger(BankController.name);
	tracer = buildTracer(BankController.name);
	@lazyInject(INJECTABLES.BankService) private bankService!: BankService;

	public list: Operation<
		ListBanksRequestServerInput,
		ListBanksRequestServerOutput,
		Context
	> = async (input, context) => {
		this.logger.addContext(context);
		this.logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			this.bankService.list(),
			this.listToOutput,
			this.throwOnLeft
		);
	};

	public get: Operation<GetBankInput, BankOutput, Context> = async (
		input,
		context
	) => {
		this.logger.addContext(context);
		this.logger.info(`Event: ${prettyPrint(input)}`);

		return pipe(
			mapGetBankInput(input),
			taskEither.chain((id) => this.bankService.get(id)),
			this.throwOnLeft
		);
	};

	public create: Operation<
		CreateBankRequestServerInput,
		CreateBankRequestServerOutput,
		Context
	> = async (input, context) => {
		this.logger.addContext(context);
		this.logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			mapCreateBankInput(input),
			taskEither.chain((bank) => this.bankService.create(bank)),
			this.throwOnLeft
		);
	};

	public update: Operation<
		UpdateBankRequestServerInput,
		UpdateBankRequestServerOutput,
		Context
	> = async (input, context) => {
		this.logger.addContext(context);
		this.logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			mapUpdateBankInput(input),
			taskEither.chain((bank) => this.bankService.update(bank)),
			this.throwOnLeft
		);
	};

	public delete: Operation<
		DeleteBankRequestServerInput,
		DeleteBankRequestServerOutput,
		Context
	> = async (input, context) => {
		this.logger.addContext(context);
		this.logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			mapDeleteBankInput(input),
			taskEither.chain((id) => this.bankService.delete(id)),
			this.throwOnLeft
		);
	};
}

export const bankController = new BankController();
