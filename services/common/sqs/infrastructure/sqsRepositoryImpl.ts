import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { SQSRepository } from '../domain/services/sqsRepository';
import { SQS } from 'aws-sdk';
import { taskEither } from 'fp-ts';
import { prettyPrint } from '@common/logging/prettyPrint';
import { errorResults } from '@common/results/errorResults';
import { injectable } from 'inversify';

@injectable()
export class SQSRepositoryImpl implements SQSRepository {
	private sqs = new SQS({ apiVersion: '2012-11-05' });

	write(
		queueUrl: string,
		message: string,
		context: InvocationContext
	): TaskResult<void> {
		return taskEither.tryCatch(
			() =>
				new Promise((resolve, reject) =>
					this.sqs.sendMessage(
						{
							QueueUrl: queueUrl,
							MessageBody: message,
						},
						(error) => {
							if (error) {
								reject(error.message);
							}
							resolve(void 0);
						}
					)
				),
			(error) => {
				context.logger.error(
					`Error sending message to sqs queue ${prettyPrint(error)}`
				);
				return errorResults.internalServerError(
					'Error sending message to sqs queue'
				);
			}
		);
	}
}
