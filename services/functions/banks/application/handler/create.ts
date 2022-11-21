import { getCreateBankRequestHandler } from '@api';
import {
	getApiGatewayHandler,
	tracer,
} from '@common/gateway/handler/apiGatewayHandler';
import { traceOperation } from '@common/tracing/traceLifecycle';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { bankController } from '../bankController';

export const handler: APIGatewayProxyHandler = getApiGatewayHandler(
	getCreateBankRequestHandler(traceOperation(bankController.create, tracer))
);
