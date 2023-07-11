/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { S3Repository } from '../domain/interfaces/s3Repository';
import { taskEither } from 'fp-ts';
import { ListOptions, ListResult } from '../domain/models/list';
import { S3Object } from '../domain/models/s3Object';

export class S3RepositoryMock implements S3Repository {
	list(
		_options: ListOptions,
		_bucketName: string,
		_context: InvocationContext
	): TaskResult<ListResult> {
		return taskEither.right({ objects: [], tokenForNext: undefined });
	}
	download(
		_keys: string[],
		_bucketName: string,
		_context: InvocationContext
	): TaskResult<S3Object[]> {
		return taskEither.right([]);
	}
	upload(
		_file: { name: string; content: string },
		_bucketName: string,
		_context: InvocationContext
	): TaskResult<void> {
		return taskEither.right(void 0);
	}
	deleteMultiple(
		_keys: string[],
		_bucketName: string,
		_context: InvocationContext
	): TaskResult<void> {
		return taskEither.right(void 0);
	}
}
