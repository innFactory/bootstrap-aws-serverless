import { StackContext, Function, use } from 'sst/constructs';
import { defaultFunctionProps } from 'stacks/common/defaultFunction';
import { DynamoDbStack } from 'stacks/DynamoDbStack';
import { KeysStack } from 'stacks/KeysStack';

export const getEuropaceToken = (context: StackContext) => {
	return new Function(context.stack, 'GetEuropaceToken', {
		...defaultFunctionProps(context),
		handler: 'services/functions/auth/application/handler/token.handler',
		permissions: ['secretsmanager'],
	});
};

export const preAuthentication = (
	context: StackContext,
	instanceId: string
) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { loginAttemptsTable } = use(DynamoDbStack);

	return new Function(context.stack, `${instanceId}-preAuthentication`, {
		...defaultFunctionProps(context),
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

	return new Function(context.stack, `${instanceId}-postAuthentication`, {
		...defaultFunctionProps(context),
		handler:
			'services/functions/auth/application/handler/postAuthentication.handler',
		environment: {
			LOGINATTEMPTS_TABLE: loginAttemptsTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [loginAttemptsTable],
	});
};
