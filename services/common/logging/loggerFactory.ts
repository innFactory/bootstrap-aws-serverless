import { Logger } from '@aws-lambda-powertools/logger';
import { ConstructorOptions } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';
import { LogLevel } from '@aws-sdk/client-cognito-identity-provider';
import { envEnum } from '@sst-env';
import { isDeployedStage } from 'stacks/common/isOfStage';
import { CustomLogFormatter } from './customLogFormatter';
import { LocalCustomLogFormatter } from './localCustomLogFromatter';

export const buildLogger = (serviceName: string, logger?: Logger) => {
	const stage = process.env[envEnum.SST_STAGE];
	const logLevel = process.env[envEnum.LOG_LEVEL] || 'INFO';

	const options: ConstructorOptions = {
		serviceName: serviceName,
		logLevel: logLevel as LogLevel,
		logFormatter: isDeployedStage(stage)
			? new CustomLogFormatter()
			: new LocalCustomLogFormatter(),
	};
	if (logger) {
		return logger.createChild(options);
	} else {
		const logger = new Logger({ logLevel: logLevel as LogLevel });
		return logger;
	}
};
