import { StackContext, ApiGatewayV1Api } from '@serverless-stack/resources';
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
	});

	context.stack.addOutputs({
		ApiEndpoint: api.url,
	});

	return { api };
}
