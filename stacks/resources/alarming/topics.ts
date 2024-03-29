import { StackContext, Topic } from 'sst/constructs';
import { createAlarmPublisherFunction } from './functions';

export const createAlarmTopic = (context: StackContext) =>
	new Topic(context.stack, `${context.stack.stage}-alarm-topic`, {
		subscribers: {
			alarmPublisher: {
				function: createAlarmPublisherFunction(context),
			},
		},
	});
