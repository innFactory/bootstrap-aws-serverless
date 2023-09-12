import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { SECRETS } from '../models/secrets';

export interface SecretManagerRepository {
	get<SecretType>(
		secretKey: SECRETS,
		context: InvocationContext
	): TaskResult<SecretType>;
	create<SecretType>(
		secretKey: SECRETS,
		secret: SecretType,
		context: InvocationContext
	): TaskResult<void>;
	updateSecretValue<SecretType>(
		secretKey: SECRETS,
		secret: SecretType,
		context: InvocationContext
	): TaskResult<void>;
	delete(secretKey: SECRETS, context: InvocationContext): TaskResult<void>;
}
