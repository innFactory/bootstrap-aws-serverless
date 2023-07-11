import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { S3Repository } from '../domain/interfaces/s3Repository';
import { taskEither } from 'fp-ts';
import { prettyPrint } from '@common/logging/prettyPrint';
import { errorResults } from '@common/results/errorResults';
import { S3 } from 'aws-sdk';

export class S3RepositoryImpl implements S3Repository {
	upload(
		file: { name: string; content: string },
		bucketName: string,
		context: InvocationContext
	): TaskResult<void> {
		return taskEither.tryCatch(
			async () =>
				new Promise((resolve, reject) => {
					new S3().putObject(
						{
							Bucket: bucketName,
							Key: file.name,
							ACL: 'bucket-owner-full-control',
							Body: file.content,
						},
						(error, data) => {
							if (error && error.message) {
								reject(error.message);
								return;
							}
							if (data) {
								context.logger.info(
									`Successful upload of file ${file.name} into bucket ${bucketName}`
								);
								resolve(void 0);
								return;
							}
							reject(`Unknown error`);
						}
					);
				}),
			(error) => {
				context.logger.error(
					`Error uploading file ${
						file.name
					} into s3 bucket ${bucketName} ${prettyPrint(error)}`
				);
				return errorResults.internalServerError(
					`Error uploading file into s3 bucket`
				);
			}
		);
	}

	deleteMultiple(
		keys: string[],
		bucketName: string,
		context: InvocationContext
	): TaskResult<void> {
		return taskEither.tryCatch(
			async () => {
				if (keys.length > 0) {
					const chunkSize = 1000;
					const parts = Math.floor(keys.length / chunkSize) + 1;
					const chunks = [...Array(parts).keys()].map((key) => {
						const nextEndIndex = (key + 1) * chunkSize;
						return keys.slice(
							key * chunkSize,
							nextEndIndex > keys.length
								? keys.length
								: nextEndIndex
						);
					});
					return Promise.all(
						chunks.map(
							(chunk) =>
								new Promise((resolve, reject) => {
									new S3().deleteObjects(
										{
											Bucket: bucketName,
											Delete: {
												Objects:
													chunk.map<S3.ObjectIdentifier>(
														(key) => ({
															Key: key,
														})
													),
											},
										},
										(error, data) => {
											if (error && error.message) {
												reject(error.message);
												return;
											}
											if (data) {
												if (
													(data.Errors ?? []).length >
													0
												) {
													reject(data.Errors);
													return;
												} else {
													resolve(void 0);
													return;
												}
											}
											reject('Unknown error');
										}
									);
								})
						)
					).then(() => void 0);
				} else {
					return Promise.resolve(void 0);
				}
			},
			(error) => {
				context.logger.error(
					`Error deleting objects of bucket ${bucketName} ${prettyPrint(
						error
					)}`
				);
				return errorResults.internalServerError(
					`Error deleting objects of bucket`
				);
			}
		);
	}
}
