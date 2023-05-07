import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';

export interface LoginAttemptsService {
	preAuthentication(
		userId: string,
		context: InvocationContext
	): TaskResult<void>;
	postAuthentication(
		userId: string,
		context: InvocationContext
	): TaskResult<void>;
}
