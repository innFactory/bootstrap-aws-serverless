import { bindInterfaces } from '@common/injection/bindings';
import { InternalServerError, BadRequest, NotFound } from '@api';
import { isLeft } from 'fp-ts/lib/Either';
import { TaskResult } from '@common/results/taskResult';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';

export abstract class BaseController {
	constructor() {
		bindInterfaces();
	}

	throwLeft = async <T>(taskResult: TaskResult<T>) => {
		try {
			const result = await taskResult();
			if (isLeft(result)) {
				// TODO log result.left.body.message
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
						// TODO Log unhandled status code with logger.warn
						throw new InternalServerError({
							message: '',
						});
				}
			} else {
				return result.right;
			}
		} catch (unhandledError) {
			throw new InternalServerError({
				message: '',
			});
		}
	};

	listToOutput = <T>(taskResult: TaskResult<T[]>) =>
		pipe(
			taskResult,
			taskEither.map((list) => ({
				body: list,
			}))
		);
}
