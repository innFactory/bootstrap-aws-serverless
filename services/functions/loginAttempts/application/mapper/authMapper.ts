import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { Task } from 'fp-ts/lib/Task';

export const mapResultToApiProxyResult = <T>(
	taskResult: TaskResult<T>
): Task<number> => {
	return pipe(
		taskResult,
		taskEither.match(
			(error) => error.statusCode,
			() => 200
		)
	);
};
