import { LogFormatter, LogItem } from '@aws-lambda-powertools/logger';
import { UnformattedAttributes } from '@aws-lambda-powertools/logger/lib/cjs/types/Logger';

export class CustomLogFormatter extends LogFormatter {
	public formatAttributes(attributes: UnformattedAttributes): LogItem {
		return new LogItem({
			attributes: {
				logLevel: attributes.logLevel,
				service: attributes.serviceName,
				message: attributes.message,
				lambdaFunction: {
					name: attributes.lambdaContext?.functionName,
					arn: attributes.lambdaContext?.invokedFunctionArn,
					memoryLimitInMB: attributes.lambdaContext?.memoryLimitInMB,
					version: attributes.lambdaContext?.functionVersion,
					coldStart: attributes.lambdaContext?.coldStart,
				},
				timestamp: this.formatTimestamp(attributes.timestamp), // You can extend this function
				environment: attributes.environment,
				awsRegion: attributes.awsRegion,
				correlationIds: {
					awsRequestId: attributes.lambdaContext?.awsRequestId,
					xRayTraceId: attributes.xRayTraceId,
				},

				logger: {
					sampleRateValue: attributes.sampleRateValue,
				},
			},
		});
	}
}
