/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { SecretManagerRepository } from '../domain/interfaces/secretManagerRepository';
import { secretManagerMock } from 'services/test/mockData/secretManagerMock';
import { taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import { injectable } from 'inversify';

@injectable()
export class SecretManagerRepositoryMock implements SecretManagerRepository {
	private mockToMap = () =>
		new Map<string, unknown>(
			Object.keys(secretManagerMock).map((key) => [
				key,
				secretManagerMock[key],
			])
		);
	private secretManager = this.mockToMap();

	private reset = () => {
		this.secretManager = this.mockToMap();
	};

	get<SecretType>(
		secretKey: string,
		context: InvocationContext
	): TaskResult<SecretType> {
		this.reset();
		const secret = this.secretManager.get(secretKey);

		if (secret) {
			return taskEither.right(secret as SecretType);
		} else {
			context.logger.error(`No secret for key ${secretKey}`);
			return taskEither.left(
				errorResults.internalServerError(`No secret`)
			);
		}
	}
	create<SecretType>(
		secretKey: string,
		secret: SecretType,
		_context: InvocationContext
	): TaskResult<void> {
		this.reset();
		this.secretManager.set(secretKey, secret);

		return taskEither.right(void 0);
	}
	updateSecretValue<SecretType>(
		secretKey: string,
		secret: SecretType,
		_context: InvocationContext
	): TaskResult<void> {
		this.reset();
		this.secretManager.set(secretKey, secret);

		return taskEither.right(void 0);
	}

	delete(secretKey: string, _context: InvocationContext): TaskResult<void> {
		this.reset();
		this.secretManager.delete(secretKey);

		return taskEither.right(void 0);
	}
}
