import { getDeleteUserRequestHandler } from '@api';
import {
	apiGatewayHandler,
	tracer,
} from '@common/gateway/handler/apiGatewayHandler';
import { traceOperation } from '@common/tracing/traceLifecycle';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { userController } from '../userController';

export const handler: APIGatewayProxyHandler = apiGatewayHandler.handle(
	getDeleteUserRequestHandler(traceOperation(userController.delete, tracer))
);
