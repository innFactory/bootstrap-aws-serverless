import {
	CloudWatchClient,
	PutMetricDataCommand,
	PutMetricDataCommandInput,
} from '@aws-sdk/client-cloudwatch'; // ES Modules import
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { prettyPrint } from '@common/logging/prettyPrint';
import { MetricData } from 'aws-sdk/clients/cloudwatch';
import { taskEither } from 'fp-ts';
import { isTestStage } from 'stacks/common/isOfStage';

export class MetricExporter {
	private client: CloudWatchClient;

	constructor() {
		this.client = new CloudWatchClient({ region: 'eu-central-1' });
	}

	export(metricData: MetricData, context: InvocationContext) {
		if (!isTestStage(context.stage)) {
			const metric: PutMetricDataCommandInput = {
				Namespace: `Prolo-${context.stage}`,
				MetricData: metricData,
			};
			context.logger.info(`Exporting metric`, `${prettyPrint(metric)}`);
			return taskEither.tryCatch(
				async () => {
					const command = new PutMetricDataCommand(metric);
					const response = await this.client.send(command);

					if (
						response.$metadata.httpStatusCode === undefined ||
						response.$metadata.httpStatusCode >= 300
					) {
						context.logger.warn(
							`Could not export metric ${prettyPrint(metric)}`,
							`status: ${
								response.$metadata.httpStatusCode
							}, attempts: ${prettyPrint(
								response.$metadata.attempts
							)}`
						);
					}
				},
				(e) => {
					context.logger.warn(
						`Error exporting metric ${prettyPrint(metric)}`,
						`error: ${prettyPrint(e)}`
					);
				}
			);
		} else {
			return taskEither.right(void 0);
		}
	}
}
