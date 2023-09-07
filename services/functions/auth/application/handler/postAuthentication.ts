import { PostAuthenticationTriggerHandler } from 'aws-lambda';
import { authController } from '../../../loginAttempts/application/loginAttemptsController';
import { ApiGatewayHandler } from '@common/gateway/handler/apiGatewayHandler';

export const handler: PostAuthenticationTriggerHandler = async (
	event,
	context
) => {
	const invocationContext =
		ApiGatewayHandler.createInvocationContextOrThrow(context);

	const result = await authController.postAuthentication(
		event,
		invocationContext
	);

	if (result != 200) {
		throw new Error(`Failed with status ${result.toString()}`);
	} else {
		return event;
	}
};
