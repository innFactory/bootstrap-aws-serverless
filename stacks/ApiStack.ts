import {
	StackContext,
	ApiGatewayV1Api,
	Config,
} from '@serverless-stack/resources';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { authorizer } from '@resources/authorization/authorizerFunction';
import { createBank, deleteBank, getBank, getBanks, updateBank } from '@resources/banks/banksFunctions';

export function ApiStack(context: StackContext) {
	const api = new ApiGatewayV1Api(context.stack, 'api', {
		authorizers: {
			europaceAuthorizer: {
				type: 'lambda_request',
				function: authorizer(context),
				identitySources: [
					apigateway.IdentitySource.header('Authorization'),
				],
			},
		},
		defaults: {
			authorizer: 'europaceAuthorizer',
		},

		routes: {
			'GET 	/banks': getBanks(context),
			'GET 	/banks/{id}': getBank(context),
			'POST 	/banks': createBank(context),
			'PATCH 	/banks': updateBank(context),
			'DELETE /banks/{id}': deleteBank(context),

			'ANY /{proxy+}': {
				function: 'functions/default.handler',
				authorizer: 'none',
			},
		},
		cors: true,
	});

	new Config.Parameter(context.stack, 'API_URL', {
		value: api.url,
	});

	return { api };
}
