import { getListBanksRequestHandler } from '@api';
import { getApiGatewayHandler } from '@common/apiGatewayHandler';
import { traceOperation } from '@common/tracing/traceLifecycle';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { bankController } from '../bankController';

export const handler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
	getListBanksRequestHandler(
		traceOperation(bankController.list, bankController.tracer)
	)
);
