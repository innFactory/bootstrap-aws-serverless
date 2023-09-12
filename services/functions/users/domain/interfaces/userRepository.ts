import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { PaginatedUsers, User } from '../model/user';
import { UsersRequest } from '@api';

/**
 * users are differentiated by the instanceId
 * e.g. for cognito it would be the instanceId defined in the CognitoStack
 */
export interface UserRepository {
	createUser(
		input: {
			email: string;
			password: string;
		},
		instanceId: string,
		context: InvocationContext
	): TaskResult<User>;
	setPassword(
		id: string,
		password: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<void>;
	getUserByEmail(
		email: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<User | undefined>;
	getUserById(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<User>;
	getUsers(
		instanceId: string,
		usersRequest: UsersRequest,
		context: InvocationContext
	): TaskResult<PaginatedUsers>;
	delete(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<void>;
}
