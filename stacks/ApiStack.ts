import { StackContext, ApiGatewayV1Api, Config } from 'sst/constructs';

import {
	createBank,
	deleteBank,
	getBank,
	getBanks,
	updateBank,
} from '@resources/banks/banksFunctions';
import {
	cognitoLambdaAuthorizer,
	defaultCognitoAuthorizerRouteOnTestStage,
	getCognitoAuthorizer,
} from '@resources/auth/cognitoAuthorizer';
import {
	createUser,
	deleteUser,
	getUser,
	getUserByMail,
	updatePassword,
} from '@resources/users/usersFunctions';

export function ApiStack(context: StackContext) {
	const api = new ApiGatewayV1Api(context.stack, 'api', {
		authorizers: {
			cognitoLambdaAuthorizer: cognitoLambdaAuthorizer(context),
		},
		defaults: {
			authorizer: getCognitoAuthorizer(context.stack.stage),
		},
		routes: {
			'GET 	/v1/banks': {
				function: getBanks(context),
				authorizer: getCognitoAuthorizer(context.stack.stage),
			},
			'GET 	/v1/banks/{id}': {
				function: getBank(context),
				authorizer: getCognitoAuthorizer(context.stack.stage),
			},
			'POST 	/v1/banks': {
				function: createBank(context),
				authorizer: getCognitoAuthorizer(context.stack.stage),
			},
			'PATCH 	/v1/banks': {
				function: updateBank(context),
				authorizer: getCognitoAuthorizer(context.stack.stage),
			},
			'DELETE /v1/banks/{id}': {
				function: deleteBank(context),
				authorizer: getCognitoAuthorizer(context.stack.stage),
			},

			'GET	/v1/users/{id}': {
				function: getUser(context),
				authorizer: 'none',
			},
			'GET	/v1/emails/{email}/users': {
				function: getUserByMail(context),
				authorizer: 'none',
			},
			'DELETE	/v1/users/{id}': {
				function: deleteUser(context),
				authorizer: 'none',
			},
			'POST	/v1/users': {
				function: createUser(context),
				authorizer: 'none',
			},
			'PATCH	/v1/users/{id}/password': {
				function: updatePassword(context),
				authorizer: getCognitoAuthorizer(context.stack.stage),
			},

			'ANY /{proxy+}': {
				function: 'services/functions/default.handler',
				authorizer: 'none',
			},
			...defaultCognitoAuthorizerRouteOnTestStage(context.stack.stage),
		},
		cors: true,
	});

	new Config.Parameter(context.stack, 'API_URL', {
		value: api.url,
	});

	return { api };
}
