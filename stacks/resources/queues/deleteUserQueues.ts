import { deleteUserByQueue } from '@resources/users/usersFunctions';
import { Duration } from 'aws-cdk-lib';
import { QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { QueueConsumerProps, StackContext, use } from 'sst/constructs';
import { KeysStack } from 'stacks/KeysStack';
import { createDefaultQueue } from 'stacks/common/defaultQueue';

export const createDeleteUserQueues = (context: StackContext) => {
	const { dynamoDBKey } = use(KeysStack);

	const dlqBase = createDefaultQueue(context, 'delete-user-dlq', {
		retentionPeriod: Duration.days(14),
		encryption: dynamoDBKey ? QueueEncryption.KMS : undefined,
		encryptionMasterKey: dynamoDBKey,
	});

	const queue = createDefaultQueue(context, `delete-user-queue`, {
		encryption: dynamoDBKey ? QueueEncryption.KMS : undefined,
		encryptionMasterKey: dynamoDBKey,
		deadLetterQueue: {
			queue: dlqBase.cdk.queue,
			maxReceiveCount: 3,
		},
	});

	const consumer: QueueConsumerProps = {
		cdk: {
			eventSource: {
				batchSize: 1,
				reportBatchItemFailures: true,
				maxConcurrency: 2,
			},
		},
		function: deleteUserByQueue(context),
	};

	queue.addConsumer(context.stack, consumer);

	return {
		deleteUserQueue: queue,
		deleteUserDlq: dlqBase,
	};
};
