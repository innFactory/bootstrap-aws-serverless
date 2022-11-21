import { LogFormatter } from '@aws-lambda-powertools/logger';
import {
	LogAttributes,
	UnformattedAttributes,
} from '@aws-lambda-powertools/logger/lib/types';

export class LocalCustomLogFormatter extends LogFormatter {
	public formatAttributes(attributes: UnformattedAttributes): LogAttributes {
		return {
			logLevel: attributes.logLevel,
			service: attributes.serviceName,
			message: attributes.message,
			timestamp: this.formatTimestamp(attributes.timestamp), // You can extend this function
		};
	}
}
