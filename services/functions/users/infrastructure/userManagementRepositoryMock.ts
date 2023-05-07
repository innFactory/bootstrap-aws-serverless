/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';
import { injectable } from 'inversify';
import { userManagementUsers } from 'services/test/mockData/userManagementUsersMock';
import { v4 } from 'uuid';
import { UserManagementRepository } from '../domain/interfaces/userManagementRepository';
import { UserManagementUser } from '../domain/model/userManagementUser';

@injectable()
export class UserManagementRepositoryTestMock
	implements UserManagementRepository
{
	private mockToMap = () =>
		new Map<string, UserManagementUser[]>(
			Object.keys(userManagementUsers).map((managementId) => [
				managementId,
				userManagementUsers[managementId],
			])
		);
	private db = this.mockToMap();

	private reset = () => {
		this.db = this.mockToMap();
	};

	createUser(
		input: { registrationId: string; dsrVersion: string; email: string },
		managementId: string,
		_context: InvocationContext
	): TaskResult<UserManagementUser> {
		this.reset();
		const user: UserManagementUser = {
			email: input.email,
			id: v4(),
		};
		const users = this.db.get(managementId) ?? [];
		this.db.set(managementId, users?.concat([user]));
		return taskEither.right(user);
	}

	setPassword(
		id: string,
		password: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<void> {
		this.reset();
		const usersOfPartner = this.db.get(managementId) ?? [];
		const user = usersOfPartner.find((u) => u.id === id);
		if (!user) {
			return taskEither.left(errorResults.notFound(''));
		}
		context.logger.info(
			`setting password with length: ${password.length} for user: ${id}`
		);

		return taskEither.right(undefined);
	}

	verifyUser(
		id: string,
		_password: string,
		managementId: string,
		_context: InvocationContext
	): TaskResult<void> {
		this.reset();
		const usersOfPartner = this.db.get(managementId) ?? [];
		const user = usersOfPartner.find((u) => u.id === id);
		if (user) {
			this.db.set(
				managementId,
				usersOfPartner.map((u) =>
					u.id !== user.id ? u : { ...user, status: undefined }
				)
			);
		}
		return taskEither.right(undefined);
	}

	getUserByEmail(
		email: string,
		managementId: string,
		_context: InvocationContext
	): TaskResult<UserManagementUser | undefined> {
		this.reset();
		const users = this.db.get(managementId) ?? [];
		return taskEither.right(users.find((user) => user.email === email));
	}

	getUserById(
		id: string,
		managementId: string,
		_context: InvocationContext
	): TaskResult<UserManagementUser> {
		this.reset();
		const users = this.db.get(managementId) ?? [];
		const user = users.find((user) => user.id === id);
		if (user) {
			return taskEither.right(user);
		} else {
			return taskEither.left(
				errorResults.notFound('No user found in management repository')
			);
		}
	}

	delete(
		id: string,
		managementId: string,
		_context: InvocationContext
	): TaskResult<void> {
		this.reset();
		const users = this.db.get(managementId) ?? [];
		const user = users.find((user) => user.id === id);
		if (user) {
			this.db.set(
				managementId,
				users.filter((user) => user.id === id)
			);
			return taskEither.right(void 0);
		} else {
			return taskEither.left(
				errorResults.notFound('No user found in management repository')
			);
		}
	}
}
