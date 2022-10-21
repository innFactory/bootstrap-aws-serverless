import 'reflect-metadata';
import { BankRepository } from '@functions/banks/domain/interfaces/bankRepository';
import { BankService } from '@functions/banks/domain/interfaces/bankService';
import { BankServiceImpl } from '@functions/banks/domain/services/bankServiceImpl';
import { BankRepositoryImpl } from '@functions/banks/infrastructure/bankRepositoryImpl';
import { INJECTABLES } from './injection/injectables';
import { injector } from './injection/inversify.config';

export abstract class LambdaBase {
	constructor() {
		injector.bind<BankService>(INJECTABLES.BankService).to(BankServiceImpl);
		injector
			.bind<BankRepository>(INJECTABLES.BankRepository)
			.to(BankRepositoryImpl);
	}
}
