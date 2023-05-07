import { getDeleteBankRequestHandler } from '@api';
import {
	apiGatewayHandler,
	tracer,
} from '@common/gateway/handler/apiGatewayHandler';
import { traceOperation } from '@common/tracing/traceLifecycle';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { bankController } from '../bankController';

export const handler: APIGatewayProxyHandler = apiGatewayHandler.handle(
	getDeleteBankRequestHandler(traceOperation(bankController.delete, tracer))
);
