import { StackContext } from 'sst/constructs';
import { createDefaultFunction } from 'stacks/common/defaultFunction';

export const apiKeyAuthFunction = (context: StackContext) => {
	return createDefaultFunction(context, 'apikey-auth', {
		permissions: ['secretsmanager'],
		handler:
			'services/functions/authorization/application/handler/apiKeyAuth.handler',
	});
};
