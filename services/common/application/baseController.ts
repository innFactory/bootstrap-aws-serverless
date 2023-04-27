import { bindInterfaces } from '@common/injection/bindings';
import {
	InternalServerError,
	BadRequest,
	NotFound,
	Unauthorized,
	Forbidden,
} from '@api';
import { Either, isLeft } from 'fp-ts/lib/Either';
import { TaskResult } from '@common/results/taskResult';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { Logger } from '@aws-lambda-powertools/logger';
import { prettyPrint } from '@common/logging/prettyPrint';
import { ErrorResult } from '@common/results/errorResult';

export abstract class BaseController {
	constructor() {
		bindInterfaces();
	}

	throwOnLeft =
		(logger: Logger) =>
		async <T>(taskResult: TaskResult<T>) => {
			const result = await this.extractResultOrThrow(logger)(taskResult);
			if (isLeft(result)) {
				logger.info(
					`left result: ${prettyPrint(
						result.left.statusCode
					)} ${prettyPrint(result.left.body.message)}`
				);
				switch (result.left.statusCode) {
					case 400:
						throw new BadRequest({
							message: result.left.body.message,
						});
					case 401:
						throw new Unauthorized({
							message: result.left.body.message,
						});
					case 403:
						throw new Forbidden({
							message: result.left.body.message,
						});
					case 404:
						throw new NotFound({
							message: result.left.body.message,
						});
					case 500:
						throw new InternalServerError({
							message: result.left.body.message,
						});
					default:
						logger.warn(
							`status code ${prettyPrint(
								result.left.statusCode
							)} is unhandled -> remap to internal server error`
						);
						throw new InternalServerError({
							message: result.left.body.message,
						});
				}
			} else {
				logger.debug(`right result: ${prettyPrint(result.right)}`);
				return result.right;
			}
		};

	listToOutput = <T>(taskResult: TaskResult<T[]>) =>
		pipe(
			taskResult,
			taskEither.map((list) => ({
				body: list,
			}))
		);

	private extractResultOrThrow =
		(logger: Logger) =>
		async <T>(
			taskResult: TaskResult<T>
		): Promise<Either<ErrorResult, T>> => {
			try {
				return await taskResult();
			} catch (unhandledError) {
				logger.warn(
					`error awaiting result ${prettyPrint(unhandledError)}`
				);
				throw new InternalServerError({
					message: 'Error awaiting result',
				});
			}
		};
}
