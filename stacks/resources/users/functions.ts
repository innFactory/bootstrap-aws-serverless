import { StackContext, use } from 'sst/constructs';
import { DynamoDbStack } from 'stacks/DynamoDbStack';
import * as iam from 'aws-cdk-lib/aws-iam';
import { KeysStack } from 'stacks/KeysStack';
import { CognitoStack } from 'stacks/CognitoStack';
import { createDefaultFunction } from 'stacks/common/defaultFunction';

export const createUser = (context: StackContext) => {
	const { resourceARNs, userPoolIdEnvs } = use(CognitoStack);

	return createDefaultFunction(context, 'create-user', {
		handler: 'services/functions/users/application/handler/create.handler',
		environment: {
			...userPoolIdEnvs,
		},
		permissions: [
			'secretsmanager',
			'cloudwatch',
			new iam.PolicyStatement({
				actions: [
					'cognito-idp:AdminUpdateUserAttributes',
					'cognito-idp:AdminCreateUser',
					'cognito-idp:ListUsers',
					'cognito-idp:AdminSetUserPassword',
					'cognito-idp:AdminGetUser',
				],
				effect: iam.Effect.ALLOW,
				resources: [...resourceARNs],
			}),
		],
	});
};

export const getUser = (context: StackContext) => {
	const { userPoolIdEnvs, resourceARNs } = use(CognitoStack);

	return createDefaultFunction(context, 'get-user', {
		handler: 'services/functions/users/application/handler/get.handler',
		environment: {
			...userPoolIdEnvs,
		},
		permissions: [
			new iam.PolicyStatement({
				actions: ['cognito-idp:AdminGetUser'],
				effect: iam.Effect.ALLOW,
				resources: [...resourceARNs],
			}),
		],
	});
};

export const getUserByMail = (context: StackContext) => {
	const { userPoolIdEnvs, resourceARNs } = use(CognitoStack);

	return createDefaultFunction(context, 'get-user-by-mail', {
		handler:
			'services/functions/users/application/handler/getByMail.handler',
		environment: {
			...userPoolIdEnvs,
		},
		permissions: [
			new iam.PolicyStatement({
				actions: ['cognito-idp:ListUsers'],
				effect: iam.Effect.ALLOW,
				resources: [...resourceARNs],
			}),
		],
	});
};

export const getUsers = (context: StackContext) => {
	const { userPoolIdEnvs, resourceARNs } = use(CognitoStack);

	return createDefaultFunction(context, 'get-users', {
		handler: 'services/functions/users/application/handler/all.handler',
		environment: {
			...userPoolIdEnvs,
		},
		permissions: [
			new iam.PolicyStatement({
				actions: ['cognito-idp:ListUsers'],
				effect: iam.Effect.ALLOW,
				resources: [...resourceARNs],
			}),
		],
	});
};

export const updatePassword = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { loginAttemptsTable } = use(DynamoDbStack);
	const { userPoolIdEnvs, resourceARNs } = use(CognitoStack);

	return createDefaultFunction(context, 'update-password', {
		handler:
			'services/functions/users/application/handler/updatePassword.handler',
		environment: {
			LOGINATTEMPTS_TABLE: loginAttemptsTable.tableName,
			...userPoolIdEnvs,
		},
		permissions: withDynamoDBKeyPolicy([
			'secretsmanager',
			'cloudwatch',
			new iam.PolicyStatement({
				actions: [
					'cognito-idp:AdminSetUserPassword',
					'cognito-idp:ListUsers',
					'cognito-idp:AdminGetUser',
				],
				effect: iam.Effect.ALLOW,
				resources: [...resourceARNs],
			}),
		]),
		bind: [loginAttemptsTable],
	});
};

export const deleteUser = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { loginAttemptsTable } = use(DynamoDbStack);
	const { userPoolIdEnvs, resourceARNs } = use(CognitoStack);

	const lambda = createDefaultFunction(context, `delete-user`, {
		handler: 'services/functions/users/application/handler/delete.handler',
		environment: {
			LOGINATTEMPTS_TABLE: loginAttemptsTable.tableName,
			...userPoolIdEnvs,
		},
		permissions: withDynamoDBKeyPolicy([
			new iam.PolicyStatement({
				actions: ['cognito-idp:AdminDeleteUser'],
				effect: iam.Effect.ALLOW,
				resources: [...resourceARNs],
			}),
		]),
		bind: [loginAttemptsTable],
	});

	return lambda;
};

export const deleteUserByQueue = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { loginAttemptsTable } = use(DynamoDbStack);
	const { userPoolIdEnvs, resourceARNs } = use(CognitoStack);

	return createDefaultFunction(context, 'delete-user-by-queue', {
		handler:
			'services/functions/users/application/handler/deleteByQueue.handler',
		environment: {
			LOGINATTEMPTS_TABLE: loginAttemptsTable.tableName,
			...userPoolIdEnvs,
		},
		permissions: withDynamoDBKeyPolicy([
			new iam.PolicyStatement({
				actions: ['cognito-idp:AdminDeleteUser'],
				effect: iam.Effect.ALLOW,
				resources: [...resourceARNs],
			}),
		]),
		bind: [loginAttemptsTable],
		reservedConcurrentExecutions: 2, // increase for more parallelization
	});
};
