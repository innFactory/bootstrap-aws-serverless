import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult,
	Context,
} from 'aws-lambda';
import {
	convertEvent,
	convertVersion1Response,
} from '@aws-smithy/server-apigateway';
import { ServiceHandler } from '@aws-smithy/server-common';
import { InvocationContext } from '../model/invocationContext';
import { buildLogger } from '../../logging/loggerFactory';
import { buildTracer } from '../../tracing/tracerFactory';
import { Either, isRight } from 'fp-ts/lib/Either';
import { MetricExporter } from '@common/metrics/metricExporter';
import { either } from 'fp-ts';
import { HttpResponse } from '@aws-sdk/types';
import { prettyPrint } from '@common/logging/prettyPrint';

const logger = buildLogger('bootstrap-aws-serverless');
export const tracer = buildTracer('bootstrap-aws-serverless');

export abstract class ApiGatewayHandler<T extends InvocationContext> {
	handle(handler: ServiceHandler<T>): APIGatewayProxyHandler {
		return async (
			event: APIGatewayProxyEvent,
			context: Context
		): Promise<APIGatewayProxyResult> => {
			const createdContext = this.createContext(event, context);

			if (isRight(createdContext)) {
				const invocationContext = createdContext.right;
				invocationContext.logger.addContext(context);
				invocationContext.logger.logEventIfEnabled(prettyPrint(event));

				return await this.processEvent(
					event,
					invocationContext,
					handler
				);
			} else {
				return this.convertResponse(createdContext.left);
			}
		};
	}

	protected abstract createContext(
		event: APIGatewayProxyEvent,
		context: Context
	): Either<HttpResponse, T>;

	protected createInvocationContext(
		context: Context
	): InvocationContext | undefined {
		const invocationLogger = this.initLogger(context);
		const metricExporter = new MetricExporter();
		const stage = process.env.SST_STAGE;
		if (stage === undefined) {
			invocationLogger.error('No stage defined');
			return undefined;
		}
		return {
			...context,
			logger: invocationLogger,
			tracer: tracer,
			stage: stage,
			metricExporter: metricExporter,
		};
	}

	private initLogger(context: Context) {
		const invocationLogger = buildLogger(context.functionName, logger);
		return invocationLogger;
	}

	private async processEvent<T extends InvocationContext>(
		event: APIGatewayProxyEvent,
		context: T,
		handler: ServiceHandler<T>
	) {
		const httpRequest = convertEvent(event);
		const httpResponse = await handler.handle(httpRequest, {
			...context,
		});

		return this.convertResponse(httpResponse);
	}

	private convertResponse(httpResponse: HttpResponse) {
		return convertVersion1Response({
			...httpResponse,
			headers: {
				...this.defaultHeaders(),
				...httpResponse.headers,
			},
		});
	}

	private defaultHeaders() {
		return {
			'Access-Control-Allow-Origin': '*',
			'Strict-Transport-Security':
				'max-age=63072000; includeSubDomains; preload',
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
		};
	}
}

class ApiGatewayHandlerImpl extends ApiGatewayHandler<InvocationContext> {
	protected createContext(
		_event: APIGatewayProxyEvent,
		context: Context
	): Either<HttpResponse, InvocationContext> {
		const invocationContext = this.createInvocationContext(context);
		if (invocationContext === undefined) {
			return either.left({
				statusCode: 500,
				body: 'Internal Server Error',
				headers: {
					'x-amzn-errortype': 'InternalServerErrorException',
					'content-type': 'application/json',
				},
			});
		}
		return either.right(invocationContext);
	}
}

export const apiGatewayHandler = new ApiGatewayHandlerImpl();
