import { ApiGatewayV1ApiAuthorizer } from 'sst/constructs';

export type Authorizers = {
	cognitoLambdaAuthorizer: ApiGatewayV1ApiAuthorizer;
	apiKeyAuthorizer: ApiGatewayV1ApiAuthorizer;
};
