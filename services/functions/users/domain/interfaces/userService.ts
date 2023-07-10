import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { User } from '../model/user';

export interface UserService {
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
	): TaskResult<User>;
	getUserById(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<User>;
	delete(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<void>;
}
