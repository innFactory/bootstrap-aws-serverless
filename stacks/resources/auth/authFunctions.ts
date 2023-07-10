import { StackContext, use } from 'sst/constructs';
import {
	createDefaultFunction,
	defaultFunctionProps,
} from 'stacks/common/defaultFunction';
import { DynamoDbStack } from 'stacks/DynamoDbStack';
import { KeysStack } from 'stacks/KeysStack';

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
