import { buildLogger } from '@common/logging/loggerFactory';
import { prettyPrint } from '@common/logging/prettyPrint';
import { ErrorResult } from '@common/results/errorResult';
import { StatusCodes } from '@common/results/errorResults';
import { Result } from '@common/results/result';
import { TaskResult } from '@common/results/taskResult';
import { either, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

const logger = buildLogger('mapResult');

const mapResultWithLeftToRight = <T>(
	result: Result<unknown>,
	mapRightTo: T,
	leftToRightCondition: StatusCodes,
	mapConditionalLefTo: T
): Result<T> =>
	pipe(
		result,
		either.match<ErrorResult, unknown, Result<T>>(
			(error) =>
				error.statusCode === leftToRightCondition
					? either.right(mapConditionalLefTo)
					: either.left(error),
			() => {
				logger.debug(
					`[withLeftToRight] mapRightTo ${prettyPrint(mapRightTo)}`
				);
				return either.right(mapRightTo);
			}
		)
	);

const mapTaskResultWithLeftToRight = <T>(
	result: TaskResult<unknown>,
	mapRightTo: T,
	leftToRightCondition: StatusCodes,
	mapConditionalLeftTo: T
): TaskResult<T> =>
	pipe(
		result,
		taskEither.match(
			(error) =>
				error.statusCode === leftToRightCondition
					? either.right(mapConditionalLeftTo)
					: either.left(error),
			() => {
				logger.debug(
					`[withLeftToRight] mapRightTo ${prettyPrint(mapRightTo)}`
				);
				return either.right(mapRightTo);
			}
		)
	);

const chainAndMap = <U, V, T>(
	te: (result: U) => TaskResult<V>,
	mapper: (result: U, value: V) => T
): ((ma: TaskResult<U>) => TaskResult<T>) =>
	taskEither.chain((result: U) =>
		pipe(
			te(result),
			taskEither.map((value: V) => mapper(result, value))
		)
	);

const chainAndAutoMap = <U extends object, V, MappedValueKey extends string>(
	te: (result: U) => TaskResult<V>,
	mappedValueKey: MappedValueKey
): ((ma: TaskResult<U>) => TaskResult<U & { [key in MappedValueKey]: V }>) =>
	taskEither.chain((result: U) =>
		pipe(
			te(result),
			taskEither.map(
				(value: V) =>
					({ ...result, [mappedValueKey]: value } as U & {
						[key in MappedValueKey]: V;
					})
			)
		)
	);

export const taskEitherExtended = {
	mapResultWithLeftToRight,
	mapTaskResultWithLeftToRight,
	chainAndMap,
	chainAndAutoMap,
};
