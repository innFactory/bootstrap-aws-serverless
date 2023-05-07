import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { UserManagementRepository } from '../domain/interfaces/userManagementRepository';
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
} from '@aws-sdk/client-cognito-identity-provider';
import { ServiceExceptionOptions } from '@aws-sdk/smithy-client/dist-types/exceptions';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import { prettyPrint } from '@common/logging/prettyPrint';
import { injectable } from 'inversify';
import { UserManagementUser } from '../domain/model/userManagementUser';
import { extractEnv } from '@common/utils/extractEnv';

type CognitoOperationDimension =
	| 'AdminCreateUserCommand'
	| 'ListUsersCommand'
	| 'AdminSetUserPasswordCommand'
	| 'AdminGetUserCommand'
	| 'AdminUpdateUserAttributesCommand'
	| 'AdminDeleteUserCommand';

@injectable()
export class CognitoRepository implements UserManagementRepository {
	private cognitoClient = new CognitoIdentityProviderClient({
		region: 'eu-central-1',
	});

	getUserById(
		id: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<UserManagementUser> {
		return pipe(
			this.getUserPoolId(managementId),
			taskEither.chain((userPoolId) =>
				this.getUserCommand(id, userPoolId, context)
			),
			taskEither.map<AdminGetUserCommandOutput, UserManagementUser>(
				this.mapOutFromCommand
			)
		);
	}

	createUser(
		input: {
			email: string;
		},
		managementId: string,
		context: InvocationContext
	): TaskResult<UserManagementUser> {
		const { logger } = context;

		return pipe(
			this.getUserPoolId(managementId),
			taskEither.chain((userPoolId) =>
				this.createSignUpCommand(input, userPoolId, context)
			),
			taskEither.chain((user) => {
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

	verifyUser(
		id: string,
		password: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<void> {
		return pipe(
			this.getUserPoolId(managementId),
			taskEither.chain((userPoolId) =>
				this.setPasswordCommand(id, password, userPoolId, context)
			),
			taskEither.chainFirst(() =>
				this.verifyUserEmail(id, managementId, context)
			),
			taskEither.map(() => void 0)
		);
	}

	getUserByEmail(
		email: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<UserManagementUser | undefined> {
		return pipe(
			this.getUserPoolId(managementId),
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
		managementId: string,
		context: InvocationContext
	): TaskResult<void> {
		return pipe(
			this.getUserPoolId(managementId),
			taskEither.chain((userPoolId) =>
				this.setPasswordCommand(id, password, userPoolId, context)
			),
			taskEither.map(() => void 0)
		);
	}

	delete(
		id: string,
		managementId: string,
		context: InvocationContext
	): TaskResult<void> {
		return pipe(
			this.getUserPoolId(managementId),
			taskEither.chain((userPoolId) =>
				this.deleteUserCommand(id, userPoolId, context)
			),
			taskEither.map(() => void 0)
		);
	}

	private getUserPoolId = (cognitoInstanceId: string) =>
		extractEnv(`${cognitoInstanceId}-USER_POOL_ID`, CognitoRepository.name);

	private extractEmail = (userAttributes?: AttributeType[]) =>
		userAttributes?.find((attr) => attr.Name === 'email')?.Value ?? '';

	private mapOutFromUserType = (user: UserType): UserManagementUser => ({
		id: user.Username ?? '',
		email: this.extractEmail(user.Attributes),
		status: user.UserStatus,
	});

	private mapOutFromCommand = (
		user: AdminGetUserCommandOutput
	): UserManagementUser => ({
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
		email: string,
		userpoolId: string,
		context: InvocationContext
	): TaskResult<UpdateUserAttributesCommandOutput> {
		return this.sendCommand(
			this.cognitoClient.send(
				new AdminUpdateUserAttributesCommand({
					Username: email,
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
