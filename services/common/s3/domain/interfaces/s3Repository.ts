import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { ListOptions, ListResult } from '../models/list';
import { S3Object } from '../models/s3object';

export interface S3Repository {
	list(
		options: ListOptions,
		bucketName: string,
		context: InvocationContext
	): TaskResult<ListResult>;

	download(
		keys: string[],
		bucketName: string,
		context: InvocationContext
	): TaskResult<S3Object[]>;

	upload: (
		file: {
			name: string;
			content: string;
		},
		bucketName: string,
		context: InvocationContext
	) => TaskResult<void>;

	deleteMultiple: (
		keys: string[],
		bucketName: string,
		context: InvocationContext
	) => TaskResult<void>;
}
