import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { SecretManagerRepository } from '../domain/interfaces/secretManagerRepository';
import { SecretsManager } from 'aws-sdk';
import { taskEither } from 'fp-ts';
import { prettyPrint } from '@common/logging/prettyPrint';
import { errorResults } from '@common/results/errorResults';
import { injectable } from 'inversify';
import { SECRETS } from '../domain/models/secrets';

@injectable()
export class SecretManagerRepositoryImpl implements SecretManagerRepository {
	private secretManager = new SecretsManager({ apiVersion: '2017-10-17' });

	get<SecretType>(
		secretKey: SECRETS,
		context: InvocationContext
	): TaskResult<SecretType> {
		return taskEither.tryCatch(
			() => {
				return new Promise((resolve, reject) => {
					this.secretManager.getSecretValue(
						{ SecretId: secretKey },
						(error, result) => {
							if (error) {
								reject(error.message);
							} else {
								const secret = JSON.parse(
									result.SecretString ?? '{}'
								) as SecretType;
								resolve(secret);
							}
						}
					);
				});
			},
			(error) => {
				context.logger.error(
					'error retrieving secret from aws',
					prettyPrint(error)
				);
				return errorResults.internalServerError(
					'error retrieving secret from aws'
				);
			}
		);
	}

	create<SecretType>(
		secretKey: SECRETS,
		secret: SecretType,
		context: InvocationContext,
		description?: string
	): TaskResult<void> {
		return taskEither.tryCatch(
			() => {
				return new Promise((resolve, reject) => {
					this.secretManager.createSecret(
						{
							Name: secretKey,
							Description: description,
							SecretString: JSON.stringify(secret),
						},
						(error) => {
							if (error) {
								reject(error.message);
							} else {
								resolve(void 0);
							}
						}
					);
				});
			},
			(error) => {
				context.logger.warn(
					'error creating secret',
					prettyPrint(error)
				);
				return errorResults.internalServerError(
					'error creating secret'
				);
			}
		);
	}
	updateSecretValue<SecretType>(
		secretKey: SECRETS,
		secret: SecretType,
		context: InvocationContext
	): TaskResult<void> {
		return taskEither.tryCatch(
			() => {
				return new Promise((resolve, reject) => {
					this.secretManager.putSecretValue(
						{
							SecretString: JSON.stringify(secret),
							SecretId: secretKey,
						},
						(error) => {
							if (error) {
								reject(error.message);
							} else {
								resolve(void 0);
							}
						}
					);
				});
			},
			(error) => {
				context.logger.warn(
					'error updating secret',
					prettyPrint(error)
				);
				return errorResults.internalServerError(
					'error updating secret'
				);
			}
		);
	}

	delete(secretKey: SECRETS, context: InvocationContext): TaskResult<void> {
		return taskEither.tryCatch(
			() => {
				return new Promise((resolve, reject) => {
					this.secretManager.deleteSecret(
						{
							SecretId: secretKey,
							ForceDeleteWithoutRecovery: true,
						},
						(error) => {
							if (error) {
								reject(error.message);
							} else {
								resolve(void 0);
							}
						}
					);
				});
			},
			(error) => {
				context.logger.warn(
					'error deleting secret',
					prettyPrint(error)
				);
				return errorResults.internalServerError(
					'error deleting secret'
				);
			}
		);
	}
}
