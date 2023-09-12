import { InvocationContextWithUser } from '@common/gateway/model/invocationContextWithUser';
import { TaskResult } from '@common/results/taskResult';
import { PaginatedUsers, User } from '../model/user';
import { UsersRequest } from '@api';
import { InvocationContext } from '@common/gateway/model/invocationContext';

export interface UserService {
	createUser(
		input: {
			email: string;
			password: string;
		},
		instanceId: string,
		context: InvocationContextWithUser
	): TaskResult<User>;
	setPassword(
		id: string,
		password: string,
		instanceId: string,
		context: InvocationContextWithUser
	): TaskResult<void>;
	getUserByEmail(
		email: string,
		instanceId: string,
		context: InvocationContextWithUser
	): TaskResult<User>;
	getUserById(
		id: string,
		instanceId: string,
		context: InvocationContextWithUser
	): TaskResult<User>;
	getUsers(
		instanceId: string,
		usersRequest: UsersRequest,
		context: InvocationContextWithUser
	): TaskResult<PaginatedUsers>;
	delete(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<void>;
}
