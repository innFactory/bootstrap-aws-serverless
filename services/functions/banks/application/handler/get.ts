import { getGetBankRequestHandler } from '@api';
import {
	getApiGatewayHandler,
	tracer,
} from '@common/gateway/handler/apiGatewayHandler';
import { traceOperation } from '@common/tracing/traceLifecycle';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { bankController } from '../bankController';

export const handler: APIGatewayProxyHandler = getApiGatewayHandler(
	getGetBankRequestHandler(traceOperation(bankController.get, tracer))
);
