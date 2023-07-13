import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';

export interface SQSRepository {
	write(
		queueUrl: string,
		message: string,
		context: InvocationContext
	): TaskResult<void>;
}
