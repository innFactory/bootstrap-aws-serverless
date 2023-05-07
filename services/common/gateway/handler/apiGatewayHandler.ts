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
import { InvocationContextWithUser } from '../model/invocationContextWithUser';
import { buildLogger } from '../../logging/loggerFactory';
import { buildTracer } from '../../tracing/tracerFactory';
import { envEnum } from '@sst-env';

const logger = buildLogger('aws-bootstrap');
export const tracer = buildTracer('aws-bootstrap');

export function getApiGatewayHandler(
	handler: ServiceHandler<InvocationContextWithUser | InvocationContext>
): APIGatewayProxyHandler {
	return async (
		event: APIGatewayProxyEvent,
		context: Context
	): Promise<APIGatewayProxyResult> => {
		const invocationLogger = buildLogger(context.functionName, logger);
		invocationLogger.addContext(context);
		const stage = process.env[envEnum.SST_STAGE];

		if (!stage) {
			throw new Error('No stage');
		}

		const httpRequest = convertEvent(event);
		const httpResponse = await handler.handle(httpRequest, {
			...context,
			user: {
				name: event.requestContext.authorizer?.['user'],
				bankId: event.requestContext.authorizer?.['id'],
			},
			logger: invocationLogger,
			tracer: tracer,
			stage: stage,
		});
		return convertVersion1Response({
			...httpResponse,
			headers: {
				...httpResponse.headers,
				'Access-Control-Allow-Origin': '*',
			},
		});
	};
}
