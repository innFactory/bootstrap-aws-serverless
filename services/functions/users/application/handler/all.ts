import { getListUsersRequestHandler } from '@api';
import { tracer } from '@common/gateway/handler/apiGatewayHandler';
import { traceOperation } from '@common/tracing/traceLifecycle';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { userController } from '../userController';
import { userApiGatewayHandler } from '@common/gateway/handler/userApiGatewayHandler';

export const handler: APIGatewayProxyHandler = userApiGatewayHandler.handle(
	getListUsersRequestHandler(traceOperation(userController.all, tracer))
);
