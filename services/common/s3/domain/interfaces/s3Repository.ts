import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';

export interface S3Repository {
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
