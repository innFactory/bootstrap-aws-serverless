import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';
import { inject, injectable } from 'inversify';
import { UserService } from '../interfaces/userService';
import { User } from '../model/user';
import { INJECTABLES } from '@common/injection/injectables';
import { UserRepository } from '../interfaces/userRepository';
import { LoginAttemptsRepository } from '@functions/loginAttempts/domain/interfaces/loginAttemptsRepository';
import { pipe } from 'fp-ts/lib/function';
import { option, taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';

@injectable()
export class UserServiceImpl implements UserService {
	@inject(INJECTABLES.UserRepository)
	private userRepository!: UserRepository;
	@inject(INJECTABLES.LoginAttemptsRepository)
	private loginAttemptsRepository!: LoginAttemptsRepository;

	getUserById(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<User> {
		return this.userRepository.getUserById(id, instanceId, context);
	}

	createUser(
		input: {
			email: string;
			password: string;
		},
		instanceId: string,
		context: InvocationContext
	): TaskResult<User> {
		return this.userRepository.createUser(input, instanceId, context);
	}

	getUserByEmail(
		email: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<User> {
		return pipe(
			this.userRepository.getUserByEmail(email, instanceId, context),
			taskEither.chain((user) =>
				pipe(
					option.fromNullable(user),
					taskEither.fromOption(() =>
						errorResults.notFound('No user for email')
					)
				)
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
			this.userRepository.setPassword(id, password, instanceId, context),
			taskEither.chain(() =>
				this.loginAttemptsRepository.get(id, context)
			),
			taskEither.chain((loginAttempts) => {
				if (loginAttempts === undefined) {
					return taskEither.right(undefined);
				}
				return this.loginAttemptsRepository.update(
					loginAttempts,
					0,
					context
				);
			}),
			taskEither.map(() => void 0)
		);
	}

	delete(
		id: string,
		instanceId: string,
		context: InvocationContext
	): TaskResult<void> {
		return this.userRepository.delete(id, instanceId, context);
	}
}
