import {
	StackContext,
	ApiGatewayV1Api,
	Config,
} from '@serverless-stack/resources';
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

			'ANY /{proxy+}': 'functions/default.handler',
		},
		cors: true,
	});

	new Config.Parameter(context.stack, 'API_URL', {
		value: api.url,
	});

	context.stack.addOutputs({
		ApiEndpoint: api.url,
	});

	return { api };
}
