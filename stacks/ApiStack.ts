import { StackContext, ApiGatewayV1Api, Config } from 'sst/constructs';

import {
	createBank,
	deleteBank,
	getBank,
	getBanks,
	updateBank,
} from '@resources/banks/banksFunctions';

export function ApiStack(context: StackContext) {
	const api = new ApiGatewayV1Api(context.stack, 'api', {
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
