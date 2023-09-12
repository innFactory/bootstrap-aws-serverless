import { StackContext, use } from 'sst/constructs';
import { CognitoStack } from 'stacks/CognitoStack';
import { DynamoDbStack } from 'stacks/DynamoDbStack';
import { KeysStack } from 'stacks/KeysStack';
import { createDefaultFunction } from 'stacks/common/defaultFunction';

export const cognitoAuthorizationFunction = (context: StackContext) => {
	const { userPoolIdEnvs } = use(CognitoStack);

	return createDefaultFunction(context, 'cognito-authorizer', {
		environment: { ...userPoolIdEnvs },
		handler:
			'services/functions/auth/application/handler/cognitoLambdaAuthorizer.handler',
	});
};

export const preAuthentication = (
	context: StackContext,
	instanceId: string
) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { loginAttemptsTable } = use(DynamoDbStack);

	return createDefaultFunction(context, `${instanceId}-pre-authentication`, {
		handler:
			'services/functions/auth/application/handler/preAuthentication.handler',
		environment: {
			LOGINATTEMPTS_TABLE: loginAttemptsTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [loginAttemptsTable],
	});
};

export const postAuthentication = (
	context: StackContext,
	instanceId: string
) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { loginAttemptsTable } = use(DynamoDbStack);

	return createDefaultFunction(context, `${instanceId}-post-authentication`, {
		handler:
			'services/functions/auth/application/handler/postAuthentication.handler',
		environment: {
			LOGINATTEMPTS_TABLE: loginAttemptsTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [loginAttemptsTable],
	});
};
