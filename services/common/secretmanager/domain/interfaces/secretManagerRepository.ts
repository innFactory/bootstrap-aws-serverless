import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';

export interface SecretManagerRepository {
	get<SecretType>(
		secretKey: string,
		context: InvocationContext
	): TaskResult<SecretType>;
	create<SecretType>(
		secretKey: string,
		secret: SecretType,
		context: InvocationContext
	): TaskResult<void>;
	updateSecretValue<SecretType>(
		secretKey: string,
		secret: SecretType,
		context: InvocationContext
	): TaskResult<void>;
	delete(secretKey: string, context: InvocationContext): TaskResult<void>;
}
