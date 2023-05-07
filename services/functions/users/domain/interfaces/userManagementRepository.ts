import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { UserManagementUser } from '../model/userManagementUser';

/**
 * Repository for one user management
 * user managements are differentiated by the managementId
 * e.g. for cognito it would be the instanceId defined in the CognitoStack
 */
export interface UserManagementRepository {
	createUser(
		input: {
			email: string;
		},
		managementId: string,
		context: InvocationContext
	): TaskResult<UserManagementUser>;
	verifyUser(
		id: string,
		password: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<void>;
	setPassword(
		id: string,
		password: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<void>;
	getUserByEmail(
		email: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<UserManagementUser | undefined>;
	getUserById(
		id: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<UserManagementUser>;
	delete(
		id: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<void>;
}
