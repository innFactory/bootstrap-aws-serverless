import { buildLogger } from '@common/logging/loggerFactory';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';

export const extractEnv = (
	envKey: string,
	context: string
): TaskResult<string> => {
	const logger = buildLogger(context);
	const env = process.env[envKey];
	if (env) {
		return taskEither.right(env);
	} else {
		logger.warn(`[${context}] no env for ${envKey}`);
		return taskEither.left(
			errorResults.internalServerError(`no env for ${envKey}`)
		);
	}
};
