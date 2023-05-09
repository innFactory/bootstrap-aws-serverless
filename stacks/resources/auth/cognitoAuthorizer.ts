import {
	ApiGatewayV1ApiAuthorizer,
	ApiGatewayV1ApiRouteProps,
	StackContext,
	Function,
	use,
} from 'sst/constructs';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { isTestStage } from 'stacks/common/isOfStage';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { CognitoStack } from 'stacks/CognitoStack';
import { defaultFunctionProps } from 'stacks/common/defaultFunction';

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

const cognitoAuthorizationFunction = (context: StackContext) => {
	const { userPoolIdEnvs } = use(CognitoStack);

	return new Function(context.stack, 'CognitoAuthorizerLambda', {
		...defaultFunctionProps(context),
		environment: { ...userPoolIdEnvs },
		handler:
			'services/functions/auth/application/handler/cognitoLambdaAuthorizer.handler',
	});
};
