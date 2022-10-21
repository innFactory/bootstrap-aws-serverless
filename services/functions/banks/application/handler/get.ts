import { getGetBankRequestHandler } from '@api';
import { getApiGatewayHandler } from '@common/apiGatewayHandler';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { bankController } from '../bankController';

export const handler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
	getGetBankRequestHandler(bankController.get)
);
