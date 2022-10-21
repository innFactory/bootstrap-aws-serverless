import { getEchoHandler } from '@api';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { EchoOperation } from './operation';
import { getApiGatewayHandler } from 'services/common/apiGatewayHandler';

export const lambdaHandler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
	getEchoHandler(EchoOperation)
);
