import { QueueProps } from 'aws-cdk-lib/aws-sqs';
import { Queue, StackContext } from 'sst/constructs';

export const createDefaultQueue = (
	context: StackContext,
	id: string,
	queueProps: QueueProps
) => {
	return new Queue(context.stack, id, {
		cdk: {
			id: `${context.stack.stage}-${context.app.name}-${id}`,
			queue: queueProps,
		},
	});
};
