import {
	createBank,
	deleteBank,
	getBank,
	getBanks,
	updateBank,
} from '@resources/banks/functions';
import { getCognitoAuthorizer } from '@resources/auth/cognito/authorizer';
import { StackContext } from 'sst/constructs';
import { Routes } from '@resources/api/models/routes';

export const bankRoutes = (context: StackContext): Routes => ({
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
});
