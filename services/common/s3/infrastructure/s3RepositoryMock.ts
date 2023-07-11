/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { S3Repository } from '../domain/interfaces/s3Repository';
import { taskEither } from 'fp-ts';

export class S3RepositoryMock implements S3Repository {
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
