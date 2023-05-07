import 'reflect-metadata';
import { BankRepository } from '@functions/banks/domain/interfaces/bankRepository';
import { BankService } from '@functions/banks/domain/interfaces/bankService';
import { BankServiceImpl } from '@functions/banks/domain/services/bankServiceImpl';
import { BankRepositoryImpl } from '@functions/banks/infrastructure/bankRepositoryImpl';
import { INJECTABLES } from '../injection/injectables';
import { injector } from '../injection/inversify.config';
import { envEnum } from '@sst-env';
import {
	DDBKeys,
	DynamoDBRepository,
} from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { DynamoDBRepositoryImpl } from '@common/dynamodb/infrastructure/dynamoDBRepositoryImpl';
import { DynamoDBRepositoryTestMock } from '@common/dynamodb/infrastructure/dynamoDbRepositoryTestMock';
import { isDeployedStage, isTestStage } from 'stacks/common/isOfStage';
import { LoginAttemptsService } from 'services/loginAttempts/domain/interfaces/authService';
import { LoginAttemptsServiceImpl } from 'services/loginAttempts/domain/services/authServiceImpl';
import { LoginAttemptsRepositoryImpl } from 'services/loginAttempts/infrastructure/loginAttemptsRepositoryImpl';
import { LoginAttemptsRepository } from 'services/loginAttempts/domain/interfaces/loginAttemptsRepository';

export const bindInterfaces = () => {
	bindStageIndependent();

	if (isDeployedStage(process.env[envEnum.SST_STAGE])) {
		bindForDeployedStage();
	} else if (isTestStage(process.env[envEnum.SST_STAGE])) {
		bindForTestStage();
	} else {
		bindForLocalStage();
	}
};

const bindStageIndependent = () => {
	injector.bind<BankService>(INJECTABLES.BankService).to(BankServiceImpl);
	injector
		.bind<BankRepository>(INJECTABLES.BankRepository)
		.to(BankRepositoryImpl);

	injector
		.bind<LoginAttemptsService>(INJECTABLES.LoginAttemptsService)
		.to(LoginAttemptsServiceImpl);
	injector
		.bind<LoginAttemptsRepository>(INJECTABLES.LoginAttemptsRepository)
		.to(LoginAttemptsRepositoryImpl);
};

const bindForDeployedStage = () => {
	bindDynamoDBRepositryImpl();
};

const bindForTestStage = () => {
	bindDynamoDBRepositoryTestMock();
};

const bindForLocalStage = () => {
	bindDynamoDBRepositryImpl();
};

// dynamodb
const bindDynamoDBRepositryImpl = () =>
	injector
		.bind<DynamoDBRepository<DDBKeys, unknown>>(
			INJECTABLES.DynamoDBRepository
		)
		.to(DynamoDBRepositoryImpl);
const bindDynamoDBRepositoryTestMock = () =>
	injector
		.bind<DynamoDBRepository<DDBKeys, unknown>>(
			INJECTABLES.DynamoDBRepository
		)
		.to(DynamoDBRepositoryTestMock);
