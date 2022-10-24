import { createLogger } from '@aws-lambda-powertools/logger';
import { CustomLogFormatter } from './customLogFormatter';

export const buildLogger = (serviceName: string) =>
	createLogger({
		serviceName: serviceName,
		logFormatter: new CustomLogFormatter(),
	});
