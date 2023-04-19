import { Alarm, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export const createDefaultAlarm = (
	scope: Construct,
	metric: Metric,
	dimensions: string,
	stage: string
) =>
	new Alarm(scope, `${stage}-${metric.metricName}-${dimensions}`, {
		metric: metric,
		evaluationPeriods: 1,
		threshold: 1,
		treatMissingData: TreatMissingData.NOT_BREACHING,
		alarmName: `${stage}-${metric.metricName}-${dimensions}`,
	});
