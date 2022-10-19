import { TaskEither } from 'fp-ts/lib/TaskEither';
import { ErrorResult } from './errorResult';

export type TaskResult<T> = TaskEither<ErrorResult, T>;
