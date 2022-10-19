import { Either } from 'fp-ts/Either';
import { ErrorResult } from './errorResult';

export type Result<T> = Either<ErrorResult, T>;
