import { bindInterfaces } from '@common/injection/bindings';
import { InternalServerError, BadRequest, NotFound } from '@api';
import { Either, isLeft } from 'fp-ts/lib/Either';
import { TaskResult } from '@common/results/taskResult';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { prettyPrint } from '@common/logging/prettyPrint';
import { ErrorResult } from '@common/results/errorResult';

export abstract class BaseController {
	protected abstract logger: Logger;
	abstract tracer: Tracer;
	constructor() {
		bindInterfaces();
	}

	throwOnLeft = async <T>(taskResult: TaskResult<T>) => {
		const result = await this.extractResultOrThrow(taskResult);
		if (isLeft(result)) {
			this.logger.info(
				`left result: ${prettyPrint(
					result.left.statusCode
				)} ${prettyPrint(result.left.body.message)}`
			);
			switch (result.left.statusCode) {
				case 400:
					throw new BadRequest({
						message: '',
					});
				case 404:
					throw new NotFound({
						message: '',
					});
				case 500:
					throw new InternalServerError({
						message: '',
					});
				default:
					this.logger.warn(
						`status code ${prettyPrint(
							result.left.statusCode
						)} is unhandled -> remap to internal server error`
					);
					throw new InternalServerError({
						message: '',
					});
			}
		} else {
			this.logger.debug(`right result: ${prettyPrint(result.right)}`);
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

	private extractResultOrThrow = async <T>(
		taskResult: TaskResult<T>
	): Promise<Either<ErrorResult, T>> => {
		try {
			return await taskResult();
		} catch (unhandledError) {
			this.logger.warn(
				`error awaiting result ${prettyPrint(unhandledError)}`
			);
			throw new InternalServerError({
				message: '',
			});
		}
	};
}