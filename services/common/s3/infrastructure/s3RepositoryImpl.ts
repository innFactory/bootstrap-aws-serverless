import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { S3Repository } from '../domain/interfaces/s3Repository';
import { taskEither } from 'fp-ts';
import { prettyPrint } from '@common/logging/prettyPrint';
import { errorResults } from '@common/results/errorResults';
import { S3 } from 'aws-sdk';
import { Logger } from '@aws-lambda-powertools/logger';
import { pipe } from 'fp-ts/lib/function';
import { ListOptions, ListResult } from '../domain/models/list';
import { S3Object } from '../domain/models/s3Object';
interface InternalListResult {
	objects: S3.Object[] | undefined;
	tokenForNext: string | undefined;
}
type Resolver = {
	resolve: (value: InternalListResult) => void;
	reject: (value: unknown) => void;
};

export class S3RepositoryImpl implements S3Repository {
	list(
		options: ListOptions,
		bucketName: string,
		context: InvocationContext
	): TaskResult<ListResult> {
		return pipe(
			taskEither.tryCatch(
				() =>
					new Promise<InternalListResult>((resolve, reject) =>
						this.listObjectsOfBucket(
							options,
							bucketName,
							{ resolve, reject },
							context.logger
						)
					),
				(error) => {
					context.logger.error(
						`Error listing objects of bucket ${bucketName} ${prettyPrint(
							error
						)}`
					);
					return errorResults.internalServerError(
						'Error listing objects of bucket'
					);
				}
			),
			taskEither.map((listResult) => ({
				tokenForNext: listResult.tokenForNext,
				objects:
					listResult.objects
						?.filter((object) => object.Key !== undefined)
						.map((object) => ({
							name: object.Key ?? '',
						})) ?? [],
			}))
		);
	}

	download(
		keys: string[],
		bucketName: string,
		context: InvocationContext
	): TaskResult<S3Object[]> {
		return taskEither.tryCatch(
			async () => {
				if (keys) {
					const all = keys.map(
						(key) =>
							new Promise<S3Object>((resolve, reject) => {
								new S3().getObject(
									{
										Bucket: bucketName,
										Key: key,
									},
									(error, data) => {
										if (error && error.message) {
											reject(error.message);
											return;
										}
										if (data) {
											resolve({
												name: key,
												content: data.Body
													? `${data.Body.toString()}`
													: undefined,
											});
											return;
										}
										reject('Unknown error');
									}
								);
							})
					);
					return Promise.all(all);
				} else {
					return Promise.resolve([]);
				}
			},
			(error) => {
				context.logger.error(
					`Error downloading objects of bucket ${bucketName} ${prettyPrint(
						error
					)}`
				);
				return errorResults.internalServerError(
					'Error downloading objects of bucket'
				);
			}
		);
	}

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

	private listObjectsOfBucket(
		options: ListOptions,
		bucketName: string,
		resolver: Resolver,
		logger: Logger,
		tokenForNext?: string,
		resultingObjects?: S3.Object[]
	) {
		new S3().listObjectsV2(
			{ Bucket: bucketName, ContinuationToken: tokenForNext },
			(error, objects) => {
				if (error && error.message) {
					resolver.reject(error.message);
					return;
				}
				if (objects) {
					if (objects.NextContinuationToken && options.all) {
						this.listObjectsOfBucket(
							options,
							bucketName,
							resolver,
							logger,
							objects.NextContinuationToken,
							this.mergeObjects(
								resultingObjects,
								objects.Contents
							)
						);
						return;
					} else {
						resolver.resolve({
							objects: this.mergeObjects(
								resultingObjects,
								objects.Contents
							),
							tokenForNext: objects.NextContinuationToken,
						});
						return;
					}
				}
				resolver.reject('Unknown error');
			}
		);
	}

	private mergeObjects(
		resultingObjects: S3.Object[] | undefined,
		currentObjects: S3.Object[] | undefined
	): S3.Object[] | undefined {
		return resultingObjects
			? resultingObjects.concat(currentObjects ? currentObjects : [])
			: currentObjects;
	}
}
