import { ApiGatewayV1ApiAuthorizer, StackContext } from 'sst/constructs';
import { apiKeyAuthFunction } from './apiKeyAuthFunction';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export const apiKeyAuthorizer = (
	context: StackContext
): ApiGatewayV1ApiAuthorizer => {
	return {
		type: 'lambda_request',
		function: apiKeyAuthFunction(context),
		identitySources: [apigateway.IdentitySource.header('authorization')],
	};
};
