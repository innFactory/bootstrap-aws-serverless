import { tracer } from '@common/gateway/handler/apiGatewayHandler';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { bindInterfaces } from '@common/injection/bindings';
import { buildLogger } from '@common/logging/loggerFactory';
import { prettyPrint } from '@common/logging/prettyPrint';
import { MetricExporter } from '@common/metrics/metricExporter';
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
		const invocationLogger = buildLogger(this.identifier);

		try {
			invocationLogger.debug(
				`Triggered ${this.identifier}`,
				prettyPrint(event)
			);
			const stage = process.env.SST_STAGE;
			if (stage === undefined) {
				invocationLogger.error('No stage defined');
				return undefined;
			}
			const invocationContext: InvocationContext = {
				...context,
				logger: invocationLogger,
				metricExporter: new MetricExporter(),
				stage: stage,
				tracer: tracer,
			};

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

			invocationLogger.debug('batchItemFailures', prettyPrint(failures));

			return {
				batchItemFailures: failures,
			};
		} catch (error) {
			invocationLogger.warn('Unknown error', prettyPrint(error));
			throw error;
		}
	};
}
