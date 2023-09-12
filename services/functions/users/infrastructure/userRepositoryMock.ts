/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';
import { injectable } from 'inversify';
import { userManagementUsers } from 'services/test/mockData/userManagementUsersMock';
import { v4 } from 'uuid';
import { UserRepository } from '../domain/interfaces/userRepository';
import { PaginatedUsers, User } from '../domain/model/user';
import { UsersRequest } from '@api';

@injectable()
export class UserManagementRepositoryTestMock implements UserRepository {
	private mockToMap = () =>
		new Map<string, User[]>(
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
		input: { email: string; password: string },
		managementId: string,
		_context: InvocationContext
	): TaskResult<User> {
		this.reset();
		const user: User = {
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

	getUserByEmail(
		email: string,
		managementId: string,
		_context: InvocationContext
	): TaskResult<User | undefined> {
		this.reset();
		const users = this.db.get(managementId) ?? [];
		return taskEither.right(users.find((user) => user.email === email));
	}

	getUserById(
		id: string,
		managementId: string,
		_context: InvocationContext
	): TaskResult<User> {
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

	getUsers(
		_instanceId: string,
		_usersRequest: UsersRequest,
		_context: InvocationContext
	): TaskResult<PaginatedUsers> {
		throw new Error('Method not implemented.');
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
