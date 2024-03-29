import {
	ApiGatewayV1ApiAuthorizer,
	ApiGatewayV1ApiRouteProps,
	StackContext,
	use,
} from 'sst/constructs';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { isTestStage } from 'stacks/common/isOfStage';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { CognitoStack } from 'stacks/CognitoStack';
import { cognitoAuthorizationFunction } from './functions';

export const cognitoAuthorizer = (
	context: StackContext
): ApiGatewayV1ApiAuthorizer => {
	const { cognitoUserPools } = use(CognitoStack);

	return {
		type: 'user_pools',
		cdk: {
			authorizer: new CognitoUserPoolsAuthorizer(
				context.stack,
				'cognitoAuthorizer',
				{
					cognitoUserPools: cognitoUserPools,
				}
			),
		},
	};
};

export const getCognitoAuthorizer = (stage: string) =>
	!isTestStage(stage) ? 'cognitoLambdaAuthorizer' : 'none';

export const defaultCognitoAuthorizerRouteOnTestStage = (
	stage: string
): Record<string, ApiGatewayV1ApiRouteProps<'cognitoLambdaAuthorizer'>> => {
	if (!isTestStage(stage)) {
		return {};
	} else {
		return {
			'ANY /test/cognito/authorizer/route': {
				function: 'services/functions/default.handler',
				authorizer: 'cognitoLambdaAuthorizer',
			},
		};
	}
};

export const cognitoLambdaAuthorizer = (
	context: StackContext
): ApiGatewayV1ApiAuthorizer => {
	return {
		type: 'lambda_request',
		function: cognitoAuthorizationFunction(context),
		identitySources: [apigateway.IdentitySource.header('authorization')],
	};
};
