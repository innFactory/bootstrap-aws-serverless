import { Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { StackContext } from 'sst/constructs';
import { createDefaultAlarm } from '../alarm';

export const createApiGatewayErrorAlarms = (
	context: StackContext,
	stage: string
) => {
	const metric5XX = createApiGatewayErrorMetric(context, '5XX', stage);
	const alarm5XX = createDefaultAlarm(
		context.stack,
		metric5XX,
		`${stage}-${context.app.name}-api`,
		context.stack.stage
	);

	return alarm5XX;
};

const createApiGatewayErrorMetric = (
	context: StackContext,
	statusCode: string,
	stage: string
) =>
	new Metric({
		metricName: `${statusCode}Error`,
		namespace: `AWS/ApiGateway`,
		statistic: 'sum',
		dimensionsMap: {
			ApiName: `${stage}-${context.app.name}-api`,
			Stage: stage,
		},
	});
