import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { UserRepository } from '../domain/interfaces/userRepository';
import {
	CognitoIdentityProviderClient,
	AdminCreateUserCommand,
	AdminCreateUserCommandOutput,
	UpdateUserAttributesCommandOutput,
	AdminGetUserCommand,
	MessageActionType,
	AdminSetUserPasswordCommand,
	ListUsersCommand,
	AdminUpdateUserAttributesCommand,
	AdminGetUserCommandOutput,
	AttributeType,
	UserType,
	AdminDeleteUserCommand,
	ListUsersCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { ServiceExceptionOptions } from '@aws-sdk/smithy-client/dist-types/exceptions';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import { prettyPrint } from '@common/logging/prettyPrint';
import { injectable } from 'inversify';
import { PaginatedUsers, User } from '../domain/model/user';
import { extractEnv } from '@common/utils/extractEnv';
import { UsersRequest } from '@api';

type CognitoOperationDimension =
	| 'AdminCreateUserCommand'
	| 'ListUsersCommand'
	| 'AdminSetUserPasswordCommand'
	| 'AdminGetUserCommand'
	| 'AdminUpdateUserAttributesCommand'
	| 'AdminDeleteUserCommand';

interface AllRecursive {
	lastUsers: User[];
	nextKey?: string;
}

@injectable()
export class UserRepositoryImpl implements UserRepository {
	private cognitoClient = new CognitoIdentityProviderClient({
		region: 'eu-central-1',
	});

	getUserById(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<User> {
		return pipe(
			this.getUserPoolId(instanceId),
			taskEither.chain((userPoolId) =>
				this.getUserCommand(id, userPoolId, context)
			),
			taskEither.map<AdminGetUserCommandOutput, User>(
				this.mapOutFromCommand
			)
		);
	}

	getUsers(
		instanceId: string,
		usersRequest: UsersRequest,
		context: InvocationContext
	): TaskResult<PaginatedUsers> {
		return pipe(
			this.getUserPoolId(instanceId),
			taskEither.chain((userPoolId) => {
				if (usersRequest.queryAll) {
					return this.listAll(userPoolId, context);
				} else {
					return this.listUsers(
						userPoolId,
						context,
						usersRequest.limit,
						usersRequest.lastEvaluatedKey
					);
				}
			})
		);
	}

	createUser(
		input: {
			email: string;
			password: string;
		},
		instanceId: string,
		context: InvocationContext
	): TaskResult<User> {
		const { logger } = context;

		return pipe(
			this.getUserPoolId(instanceId),
			taskEither.bindTo('userPoolId'),
			taskEither.bind('user', ({ userPoolId }) =>
				this.createSignUpCommand(input, userPoolId, context)
			),
			taskEither.bind('userId', ({ user }) =>
				user.User?.Username
					? taskEither.right(user.User.Username)
					: taskEither.left(
							errorResults.internalServerError(
								'no id on created user'
							)
					  )
			),
			taskEither.chainFirst(({ userPoolId, userId }) =>
				this.setPasswordCommand(
					userId,
					input.password,
					userPoolId,
					context
				)
			),
			taskEither.chainFirst(({ userId, userPoolId }) =>
				this.verifyUserEmail(userId, userPoolId, context)
			),
			taskEither.chain(({ user }) => {
				if (user.User) {
					logger.info(`user created: ${prettyPrint(user)}`);
					return taskEither.right(user.User);
				} else {
					return taskEither.left(
						errorResults.internalServerError(
							'user creation was successful but user was not returned'
						)
					);
				}
			}),
			taskEither.map(this.mapOutFromUserType)
		);
	}

	getUserByEmail(
		email: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<User | undefined> {
		return pipe(
			this.getUserPoolId(instanceId),
			taskEither.chain((userPoolId) =>
				this.findUserByEmailCommand(email, userPoolId, context)
			),
			taskEither.chain((user) => {
				if (!user.Users) return taskEither.right(undefined);
				if (user.Users.length === 1) {
					return taskEither.right(user.Users[0]);
				} else if (user.Users.length > 1) {
					return taskEither.left(
						errorResults.conflict('multiple users with same email')
					);
				}
				return taskEither.right(undefined);
			}),
			taskEither.map((user) =>
				user ? this.mapOutFromUserType(user) : undefined
			)
		);
	}

	setPassword(
		id: string,
		password: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<void> {
		return pipe(
			this.getUserPoolId(instanceId),
			taskEither.chain((userPoolId) =>
				this.setPasswordCommand(id, password, userPoolId, context)
			),
			taskEither.map(() => void 0)
		);
	}

	delete(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<void> {
		return pipe(
			this.getUserPoolId(instanceId),
			taskEither.chain((userPoolId) =>
				this.deleteUserCommand(id, userPoolId, context)
			),
			taskEither.map(() => void 0)
		);
	}

	private listAll(userpoolId: string, context: InvocationContext) {
		const resolveRecursive = (
			recursive: AllRecursive
		): TaskResult<PaginatedUsers> =>
			pipe(
				this.sendCommand(
					this.cognitoClient.send(
						new ListUsersCommand({
							UserPoolId: userpoolId,
							Limit: 60,
							PaginationToken: recursive.nextKey,
						})
					),
					'ListUsersCommand',
					context
				),
				taskEither.chain((result) => {
					const users: User[] = recursive.lastUsers.concat(
						result.Users?.map((user) => ({
							email: this.extractEmail(user.Attributes),
							id: user.Username ?? '',
							status: user.UserStatus ?? '',
						})) ?? []
					);
					if (result.PaginationToken) {
						return resolveRecursive({
							lastUsers: users,
							nextKey: result.PaginationToken,
						});
					} else {
						const paginated: PaginatedUsers = {
							lastEvaluatedKey: undefined,
							users: users,
						};
						return taskEither.right(paginated);
					}
				})
			);

		return resolveRecursive({ lastUsers: [] });
	}

	private listUsers(
		userpoolId: string,
		context: InvocationContext,
		limit: number | undefined,
		lastEvaluatedKey: string | undefined
	): TaskResult<PaginatedUsers> {
		return pipe(
			this.sendCommand(
				this.cognitoClient.send(
					new ListUsersCommand({
						UserPoolId: userpoolId,
						Limit: limit ?? 60,
						PaginationToken: lastEvaluatedKey,
					})
				),
				'ListUsersCommand',
				context
			),
			taskEither.map<ListUsersCommandOutput, PaginatedUsers>(
				(result) => ({
					users:
						result.Users?.map((user) => ({
							email: this.extractEmail(user.Attributes),
							id: user.Username ?? '',
							status: user.UserStatus ?? '',
						})) ?? [],
					lastEvaluatedKey: result.PaginationToken,
				})
			)
		);
	}

	private getUserPoolId = (cognitoInstanceId: string) =>
		extractEnv(
			`${cognitoInstanceId}_USER_POOL_ID`,
			UserRepositoryImpl.name
		);

	private extractEmail = (userAttributes?: AttributeType[]) =>
		userAttributes?.find((attr) => attr.Name === 'email')?.Value ?? '';

	private mapOutFromUserType = (user: UserType): User => ({
		id: user.Username ?? '',
		email: this.extractEmail(user.Attributes),
		status: user.UserStatus,
	});

	private mapOutFromCommand = (user: AdminGetUserCommandOutput): User => ({
		id: user.Username ?? '',
		email: this.extractEmail(user.UserAttributes),
		status: user.UserStatus,
	});

	private sendCommand<T>(
		promResult: Promise<T>,
		operation: CognitoOperationDimension,
		context: InvocationContext
	) {
		const { logger } = context;
		return taskEither.tryCatch(
			async () => {
				const result = await promResult.catch(async (e) => {
					context.logger.debug(
						`cognito error`,
						prettyPrint(operation)
					);

					throw e;
				});
				return result;
			},
			(e) => {
				const error = e as ServiceExceptionOptions;
				const msg = `cognito error: ${prettyPrint(e)}`;
				logger.warn(msg);
				const responseMsg =
					error.name && error.message
						? `${error.name} ${error.message}`
						: 'Unknown cognito error';
				switch (error.name) {
					case 'UsernameExistsException':
						return errorResults.conflict(responseMsg);
					case 'InvalidParameterException':
						return errorResults.badRequest(responseMsg);
					case 'UserNotFoundException':
						return errorResults.notFound(responseMsg);
					default:
						return errorResults.internalServerError(responseMsg);
				}
			}
		);
	}

	private deleteUserCommand(
		id: string,
		userpoolId: string,
		context: InvocationContext
	) {
		return this.sendCommand(
			this.cognitoClient.send(
				new AdminDeleteUserCommand({
					UserPoolId: userpoolId,
					Username: id,
				})
			),
			'AdminDeleteUserCommand',
			context
		);
	}

	private findUserByEmailCommand(
		email: string,
		userpoolId: string,
		context: InvocationContext
	) {
		return this.sendCommand(
			this.cognitoClient.send(
				new ListUsersCommand({
					UserPoolId: userpoolId,
					Filter: `email = "${email}"`,
				})
			),
			'ListUsersCommand',
			context
		);
	}

	private setPasswordCommand(
		email: string,
		password: string,
		userpoolId: string,
		context: InvocationContext,
		permanent = true
	) {
		return this.sendCommand(
			this.cognitoClient.send(
				new AdminSetUserPasswordCommand({
					Username: email,
					UserPoolId: userpoolId,
					Password: password,
					Permanent: permanent,
				})
			),
			'AdminSetUserPasswordCommand',
			context
		);
	}

	private getUserCommand(
		email: string,
		userpoolId: string,
		context: InvocationContext
	): TaskResult<AdminGetUserCommandOutput> {
		return this.sendCommand(
			this.cognitoClient.send(
				new AdminGetUserCommand({
					Username: email,
					UserPoolId: userpoolId,
				})
			),
			'AdminGetUserCommand',
			context
		);
	}

	private verifyUserEmail(
		id: string,
		userpoolId: string,
		context: InvocationContext
	): TaskResult<UpdateUserAttributesCommandOutput> {
		return this.sendCommand(
			this.cognitoClient.send(
				new AdminUpdateUserAttributesCommand({
					Username: id,
					UserPoolId: userpoolId,
					UserAttributes: [
						{
							Name: 'email_verified',
							Value: 'true',
						},
					],
				})
			),
			'AdminUpdateUserAttributesCommand',
			context
		);
	}

	private createSignUpCommand(
		input: {
			email: string;
		},
		userPoolId: string,
		context: InvocationContext
	): TaskResult<AdminCreateUserCommandOutput> {
		return this.sendCommand(
			this.cognitoClient.send(
				new AdminCreateUserCommand({
					UserPoolId: userPoolId,
					Username: input.email,
					MessageAction: MessageActionType.SUPPRESS,
				})
			),
			'AdminCreateUserCommand',
			context
		);
	}
}
