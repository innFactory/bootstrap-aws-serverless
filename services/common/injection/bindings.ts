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
import { DynamoDBRepositoryMock } from '@common/dynamodb/infrastructure/dynamoDbRepositoryMock';
import { isDeployedStage, isTestStage } from 'stacks/common/isOfStage';
import { LoginAttemptsService } from '@functions/loginAttempts/domain/interfaces/authService';
import { LoginAttemptsServiceImpl } from '@functions/loginAttempts/domain/services/authServiceImpl';
import { LoginAttemptsRepositoryImpl } from '@functions/loginAttempts/infrastructure/loginAttemptsRepositoryImpl';
import { LoginAttemptsRepository } from '@functions/loginAttempts/domain/interfaces/loginAttemptsRepository';
import { UserRepository } from '@functions/users/domain/interfaces/userRepository';
import { UserRepositoryImpl } from '@functions/users/infrastructure/userRepositoryImpl';
import { UserService } from '@functions/users/domain/interfaces/userService';
import { UserServiceImpl } from '@functions/users/domain/services/userServiceImpl';
import { S3Repository } from '@common/s3/domain/interfaces/s3Repository';
import { S3RepositoryImpl } from '@common/s3/infrastructure/s3RepositoryImpl';
import { S3RepositoryMock } from '@common/s3/infrastructure/s3RepositoryMock';
import { SecretManagerRepository } from '@common/secretmanager/domain/interfaces/secretManagerRepository';
import { SecretManagerRepositoryImpl } from '@common/secretmanager/infrastructure/secretManagerRepositoryImpl';
import { SecretManagerRepositoryMock } from '@common/secretmanager/infrastructure/secretManagerRepositoryMock';

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

	injector.bind<UserService>(INJECTABLES.UserService).to(UserServiceImpl);
};

const bindForDeployedStage = () => {
	bindDynamoDBRepositryImpl();
	bindSecretManagerRepositoryImpl();
	bindS3RepositryImpl();
	bindUserRepository();
};

const bindForTestStage = () => {
	bindDynamoDBRepositoryMock();
	bindSecretManagerRepositoryMock();
	bindS3RepositoryMock();
	bindUserRepositoryMock();
};

const bindForLocalStage = () => {
	bindDynamoDBRepositryImpl();
	bindSecretManagerRepositoryImpl();
	bindS3RepositryImpl();
	bindUserRepository();
};

// dynamodb
const bindDynamoDBRepositryImpl = () =>
	injector
		.bind<DynamoDBRepository<DDBKeys, unknown>>(
			INJECTABLES.DynamoDBRepository
		)
		.to(DynamoDBRepositoryImpl);
const bindDynamoDBRepositoryMock = () =>
	injector
		.bind<DynamoDBRepository<DDBKeys, unknown>>(
			INJECTABLES.DynamoDBRepository
		)
		.to(DynamoDBRepositoryMock);

// secretmanager
const bindSecretManagerRepositoryImpl = () =>
	injector
		.bind<SecretManagerRepository>(INJECTABLES.SecretManagerRepository)
		.to(SecretManagerRepositoryImpl);
const bindSecretManagerRepositoryMock = () =>
	injector
		.bind<SecretManagerRepository>(INJECTABLES.SecretManagerRepository)
		.to(SecretManagerRepositoryMock);

// s3
const bindS3RepositryImpl = () =>
	injector.bind<S3Repository>(INJECTABLES.S3Repository).to(S3RepositoryImpl);
const bindS3RepositoryMock = () =>
	injector.bind<S3Repository>(INJECTABLES.S3Repository).to(S3RepositoryMock);

// user
const bindUserRepository = () =>
	injector
		.bind<UserRepository>(INJECTABLES.UserRepository)
		.to(UserRepositoryImpl);
const bindUserRepositoryMock = () =>
	injector
		.bind<UserRepository>(INJECTABLES.UserRepository)
		.to(UserRepositoryImpl);
