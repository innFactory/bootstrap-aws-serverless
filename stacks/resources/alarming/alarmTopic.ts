import { StackContext, Topic } from 'sst/constructs';
import { createAlarmPublisherFunction } from './alarmPublisherFunction';

export const createAlarmTopic = (context: StackContext) =>
	new Topic(context.stack, `AlarmTopic-${context.stack.stage}`, {
		subscribers: {
			alarmPublisher: {
				function: createAlarmPublisherFunction(context),
			},
		},
	});
