import { Logger } from '@aws-lambda-powertools/logger';
import { prettyPrint } from '@common/logging/prettyPrint';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { SecretsManager } from 'aws-sdk';
import { taskEither } from 'fp-ts';

const secretsManager = new SecretsManager({
	region: 'eu-central-1',
});

export const getAwsSecret = <T>(
	awsSecretId: string,
	logger: Logger
): TaskResult<T> => {
	return taskEither.tryCatch(
		async () => {
			logger.debug(
				'reading secret for awsSecretId',
				prettyPrint(awsSecretId)
			);
			const secretValue = await secretsManager
				.getSecretValue({ SecretId: awsSecretId })
				.promise();
			logger.debug(
				'awsSecretResponse',
				secretValue.SecretString
					? `secret with length ${secretValue.SecretString?.length} present`
					: 'secret is undefined'
			);
			return JSON.parse(secretValue.SecretString ?? '') as T;
		},
		(error) => {
			logger.error(
				'error retrieving secret from aws',
				prettyPrint(error)
			);
			return errorResults.internalServerError(
				'error retrieving europace secret from aws'
			);
		}
	);
};
