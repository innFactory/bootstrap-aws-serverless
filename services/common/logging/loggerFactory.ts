import { createLogger, Logger } from '@aws-lambda-powertools/logger';
import {
	ConstructorOptions,
	LogLevel,
} from '@aws-lambda-powertools/logger/lib/types';
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
	}
	return createLogger(options);
};
