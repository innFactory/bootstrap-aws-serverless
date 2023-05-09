import {
	CreateUserRequestServerInput,
	CreateUserRequestServerOutput,
	DeleteUserRequestServerInput,
	DeleteUserRequestServerOutput,
	GetUserByMailRequestServerInput,
	GetUserByMailRequestServerOutput,
	GetUserRequestServerInput,
	GetUserRequestServerOutput,
	UpdatePasswordRequestServerInput,
	UpdatePasswordRequestServerOutput,
} from '@api';
import { Operation } from '@aws-smithy/server-common';
import { BaseController } from '@common/application/baseController';
import { InvocationContext } from '@common/gateway/model/invocationContext';
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
	mapUpdatePasswordInput,
} from './mapper/applicationToDomain';

class UserController extends BaseController {
	@lazyInject(INJECTABLES.UserService) private userService!: UserService;

	public create: Operation<
		CreateUserRequestServerInput,
		CreateUserRequestServerOutput,
		InvocationContext
	> = async (input, context) =>
		pipe(
			mapCreateUserInput(input),
			taskEither.chain(({ email, password }) =>
				this.userService.createUser(
					{ email, password },
					'example',
					context
				)
			),
			this.throwOnLeft(context.logger)
		);

	public get: Operation<
		GetUserRequestServerInput,
		GetUserRequestServerOutput,
		InvocationContext
	> = async (input, context) =>
		pipe(
			mapGetUserInput(input),
			taskEither.chain(({ id }) =>
				this.userService.getUserById(id, 'example', context)
			),
			this.throwOnLeft(context.logger)
		);

	public getByMail: Operation<
		GetUserByMailRequestServerInput,
		GetUserByMailRequestServerOutput,
		InvocationContext
	> = async (input, context) =>
		pipe(
			mapGetUserByMailInput(input),
			taskEither.chain(({ email }) =>
				this.userService.getUserByEmail(email, 'example', context)
			),
			this.throwOnLeft(context.logger)
		);

	public updatePassword: Operation<
		UpdatePasswordRequestServerInput,
		UpdatePasswordRequestServerOutput,
		InvocationContext
	> = async (input, context) =>
		pipe(
			mapUpdatePasswordInput(input),
			taskEither.chain(({ id, password }) =>
				this.userService.setPassword(id, password, 'example', context)
			),
			taskEither.map(() => ({})),
			this.throwOnLeft(context.logger)
		);

	public delete: Operation<
		DeleteUserRequestServerInput,
		DeleteUserRequestServerOutput,
		InvocationContext
	> = async (input, context) =>
		pipe(
			mapDeleteUserInput(input),
			taskEither.chain(({ id }) =>
				this.userService.delete(id, 'example', context)
			),
			taskEither.map(() => ({})),
			this.throwOnLeft(context.logger)
		);
}

export const userController = new UserController();
