import {
	CreateUserRequestServerInput,
	CreateUserRequestServerOutput,
	DeleteUserRequestServerInput,
	DeleteUserRequestServerOutput,
	GetUserByMailRequestServerInput,
	GetUserByMailRequestServerOutput,
	GetUserRequestServerInput,
	GetUserRequestServerOutput,
	ListUsersRequestServerInput,
	ListUsersRequestServerOutput,
	UpdatePasswordRequestServerInput,
	UpdatePasswordRequestServerOutput,
} from '@api';
import { Operation } from '@aws-smithy/server-common';
import { BaseController } from '@common/application/baseController';
import { lazyInject } from '@common/injection/decorator';
import { INJECTABLES } from '@common/injection/injectables';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { UserService } from '../domain/interfaces/userService';
import {
	mapCreateUserInput,
	mapDeleteUserInput,
	mapGetUserByMailInput,
	mapGetUserInput,
	mapGetUsersInput,
	mapUpdatePasswordInput,
} from './mapper/applicationToDomain';
import { InvocationContextWithUser } from '@common/gateway/model/invocationContextWithUser';

class UserController extends BaseController {
	private COGNITO_IDENTIFIER = 'example';
	@lazyInject(INJECTABLES.UserService) private userService!: UserService;

	public create: Operation<
		CreateUserRequestServerInput,
		CreateUserRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) =>
		pipe(
			mapCreateUserInput(input),
			taskEither.chain(({ email, password }) =>
				this.userService.createUser(
					{ email, password },
					this.COGNITO_IDENTIFIER,
					context
				)
			),
			this.throwOnLeft(context.logger)
		);

	public get: Operation<
		GetUserRequestServerInput,
		GetUserRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) =>
		pipe(
			mapGetUserInput(input),
			taskEither.chain(({ id }) =>
				this.userService.getUserById(
					id,
					this.COGNITO_IDENTIFIER,
					context
				)
			),
			this.throwOnLeft(context.logger)
		);

	public all: Operation<
		ListUsersRequestServerInput,
		ListUsersRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) =>
		pipe(
			mapGetUsersInput(input),
			taskEither.chain((input) =>
				this.userService.getUsers(
					this.COGNITO_IDENTIFIER,
					input,
					context
				)
			),
			taskEither.map((result) => {
				const out: ListUsersRequestServerOutput = {
					items: result.users,
					lastEvaluatedKey: result.lastEvaluatedKey,
				};
				return out;
			}),
			this.throwOnLeft(context.logger)
		);

	public getByMail: Operation<
		GetUserByMailRequestServerInput,
		GetUserByMailRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) =>
		pipe(
			mapGetUserByMailInput(input),
			taskEither.chain(({ email }) =>
				this.userService.getUserByEmail(
					email,
					this.COGNITO_IDENTIFIER,
					context
				)
			),
			this.throwOnLeft(context.logger)
		);

	public updatePassword: Operation<
		UpdatePasswordRequestServerInput,
		UpdatePasswordRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) =>
		pipe(
			mapUpdatePasswordInput(input),
			taskEither.chain(({ id, password }) =>
				this.userService.setPassword(
					id,
					password,
					this.COGNITO_IDENTIFIER,
					context
				)
			),
			taskEither.map(() => ({})),
			this.throwOnLeft(context.logger)
		);

	public delete: Operation<
		DeleteUserRequestServerInput,
		DeleteUserRequestServerOutput,
		InvocationContextWithUser
	> = async (input, context) =>
		pipe(
			mapDeleteUserInput(input),
			taskEither.chain(({ id }) =>
				this.userService.delete(id, this.COGNITO_IDENTIFIER, context)
			),
			taskEither.map(() => ({})),
			this.throwOnLeft(context.logger)
		);
}

export const userController = new UserController();
