import { Alarm, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { StackContext, use } from 'sst/constructs';
import { QueuesStack } from 'stacks/QueuesStack';

export const createDeadLetterQueuesErrorAlarms = (context: StackContext) => {
	const { deleteUserQueues } = use(QueuesStack);
	const deleteUserDlqAlarm = createDeadLetterQueueErrorAlarm(
		context.stack,
		`${context.app.stage}-delete-user-dlq`,
		deleteUserQueues.deleteUserDlq.queueName
	);

	return [deleteUserDlqAlarm];
};

const createDeadLetterQueueErrorAlarm = (
	scope: Construct,
	alarmPrefix: string,
	queueName: string
) => {
	const metric = createDeadLetterQueueErrorMetric(queueName);
	const alarm = new Alarm(
		scope,
		`${alarmPrefix}-${metric.namespace}-${metric.metricName}`,
		{
			metric: metric,
			evaluationPeriods: 1,
			threshold: 1,
			treatMissingData: TreatMissingData.NOT_BREACHING,
			alarmName: `${alarmPrefix}-${metric.namespace}-${metric.metricName}`,
		}
	);

	return alarm;
};

const createDeadLetterQueueErrorMetric = (queueName: string) =>
	new Metric({
		metricName: 'NumberOfMessagesSent',
		namespace: `AWS/SQS`,
		statistic: 'sum',
		dimensionsMap: {
			QueueName: queueName,
		},
	});
