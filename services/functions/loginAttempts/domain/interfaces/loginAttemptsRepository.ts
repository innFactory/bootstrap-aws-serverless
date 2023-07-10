import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { LoginAttemptDDB } from '@functions/loginAttempts/infrastructure/model/loginAttempts';

export interface LoginAttemptsRepository {
	get(
		userId: string,
		context: InvocationContext
	): TaskResult<LoginAttemptDDB | undefined>;
	update(
		loginAttempt: LoginAttemptDDB,
		attempts: number,
		context: InvocationContext
	): TaskResult<number>;
	create(
		userId: string,
		context: InvocationContext
	): TaskResult<LoginAttemptDDB>;
	delete(userId: string, context: InvocationContext): TaskResult<void>;
}
