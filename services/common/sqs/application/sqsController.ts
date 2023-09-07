import { ApiGatewayHandler } from '@common/gateway/handler/apiGatewayHandler';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { bindInterfaces } from '@common/injection/bindings';
import { prettyPrint } from '@common/logging/prettyPrint';
import { ErrorResult } from '@common/results/errorResult';
import { SQSBatchItemFailure, SQSHandler } from 'aws-lambda';
import { taskEither } from 'fp-ts';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

export abstract class SQSController<Message> {
	protected abstract identifier: string;

	protected abstract handleMessage(
		message: Message,
		context: InvocationContext
	): TaskEither<ErrorResult, void>;

	constructor() {
		bindInterfaces();
	}

	public handler: SQSHandler = async (event, context) => {
		const invocationContext =
			ApiGatewayHandler.createInvocationContextOrThrow(context);

		try {
			const results = event.Records.map((record) => {
				return pipe(
					this.handleMessage(
						JSON.parse(record.body),
						invocationContext
					),
					taskEither.mapLeft(() => {
						return record;
					})
				);
			});

			const mappedToPromise = results.map((result) =>
				pipe(
					result,
					taskEither.match(
						(failedItem) => failedItem,
						() => undefined
					)
				)()
			);

			const itemsToRetry = await Promise.all(mappedToPromise);

			const failures: SQSBatchItemFailure[] = itemsToRetry
				.filter((v) => v !== undefined)
				.map((record) => ({
					itemIdentifier: record?.messageId ?? '',
				}));

			invocationContext.logger.debug(
				'batchItemFailures',
				prettyPrint(failures)
			);

			return {
				batchItemFailures: failures,
			};
		} catch (error) {
			invocationContext.logger.warn('Unknown error', prettyPrint(error));
			throw error;
		}
	};
}
