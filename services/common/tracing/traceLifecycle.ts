import { Operation } from '@aws-smithy/server-common';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { TaskResult } from '@common/results/taskResult';
import { Segment, Subsegment } from 'aws-xray-sdk-core';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { prettyPrint } from '@common/logging/prettyPrint';

export const traceOperation = <I, O, Context>(
	operation: Operation<I, O, Context>,
	tracer: Tracer
): Operation<I, O, Context> => {
	return (input: I, context: Context) =>
		tracePromise(operation(input, context), tracer);
};

export const traceTaskResult = <T>(
	taskResult: TaskResult<T>,
	tracer: Tracer
): TaskResult<T> => {
	const { parent, child } = startTrace(tracer);
	return pipe(
		taskResult,
		taskEither.map((result) => traceResult(tracer, result)),
		taskEither.mapLeft((error) => {
			tracer.addErrorAsMetadata(new Error(prettyPrint(error)));
			return error;
		}),
		(result) => {
			endTrace(tracer, parent, child);
			return result;
		}
	);
};

export const tracePromise = <T>(
	promise: Promise<T>,
	tracer: Tracer
): Promise<T> => {
	const { parent, child } = startTrace(tracer);

	return promise
		.then((result) => traceResult(tracer, result))
		.catch((error) => {
			tracer.addErrorAsMetadata(error as Error);
			throw error;
		})
		.finally(() => endTrace(tracer, parent, child));
};

const startTrace = (tracer: Tracer) => {
	const parent = tracer.getSegment(); // This is the facade segment (the one that is created by AWS Lambda)
	// Create subsegment for the function & set it as active
	const child = parent.addNewSubsegment(`## ${process.env._HANDLER}`);
	tracer.setSegment(child);

	// Annotate the subsegment with the cold start & serviceName
	tracer.annotateColdStart();
	tracer.addServiceNameAnnotation();

	return { parent, child };
};

const traceResult = <T>(tracer: Tracer, result: T): T => {
	tracer.addResponseAsMetadata(result, process.env._HANDLER);
	return result;
};

const endTrace = (
	tracer: Tracer,
	parent: Subsegment | Segment,
	child: Subsegment
): void => {
	// Close subsegment (the AWS Lambda one is closed automatically)
	child.close();
	// Set back the facade segment as active again
	tracer.setSegment(parent);
};
