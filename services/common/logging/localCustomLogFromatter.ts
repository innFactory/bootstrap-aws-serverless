import { LogFormatter, LogItem } from '@aws-lambda-powertools/logger';
import { UnformattedAttributes } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';

export class LocalCustomLogFormatter extends LogFormatter {
	public formatAttributes(attributes: UnformattedAttributes): LogItem {
		return new LogItem({
			attributes: {
				logLevel: attributes.logLevel,
				service: attributes.serviceName,
				message: attributes.message,
				timestamp: this.formatTimestamp(attributes.timestamp), // You can extend this function
			},
		});
	}
}
