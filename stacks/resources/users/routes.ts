import { StackContext } from 'sst/constructs';
import {
	createUser,
	deleteUser,
	getUser,
	getUserByMail,
	getUsers,
	updatePassword,
} from '@resources/users/functions';
import { getCognitoAuthorizer } from '@resources/auth/cognito/authorizer';
import { Routes } from '@resources/api/models/routes';

export const userRoutes = (context: StackContext): Routes => ({
	'GET /v1/users': {
		function: getUsers(context),
		authorizer: getCognitoAuthorizer(context.stack.stage),
	},
	'GET	/v1/users/{id}': {
		function: getUser(context),
		authorizer: getCognitoAuthorizer(context.stack.stage),
	},
	'GET	/v1/emails/{email}/users': {
		function: getUserByMail(context),
		authorizer: getCognitoAuthorizer(context.stack.stage),
	},
	'DELETE	/v1/users/{id}': {
		function: deleteUser(context),
		authorizer: getCognitoAuthorizer(context.stack.stage),
	},
	'POST	/v1/users': {
		function: createUser(context),
		authorizer: getCognitoAuthorizer(context.stack.stage),
	},
	'PATCH	/v1/users/{id}/password': {
		function: updatePassword(context),
		authorizer: getCognitoAuthorizer(context.stack.stage),
	},
});
