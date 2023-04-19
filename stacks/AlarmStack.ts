import { createApiGatewayErrorAlarms } from '@resources/alarming/alarms/apiGateway/errors';
import { createAlarmTopic } from '@resources/alarming/alarmTopic';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { StackContext } from 'sst/constructs';

export const AlarmStack = (context: StackContext) => {
	const alarms = [createApiGatewayErrorAlarms(context, context.stack.stage)];
	const alarmTopic = createAlarmTopic(context);

	alarms.forEach((alarm) =>
		alarm.addAlarmAction(new SnsAction(alarmTopic.cdk.topic))
	);

	return { alarms, alarmTopic };
};
