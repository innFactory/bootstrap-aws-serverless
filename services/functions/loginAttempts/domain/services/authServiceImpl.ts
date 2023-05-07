import { InvocationContext } from '@common/gateway/model/invocationContext';
import { INJECTABLES } from '@common/injection/injectables';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { inject, injectable } from 'inversify';
import { LoginAttemptsService } from '../interfaces/authService';
import { LoginAttemptsRepository } from '../interfaces/loginAttemptsRepository';

@injectable()
export class LoginAttemptsServiceImpl implements LoginAttemptsService {
	@inject(INJECTABLES.LoginAttemptsRepository)
	private loginAttemptsRepository!: LoginAttemptsRepository;

	preAuthentication = (
		userId: string,
		context: InvocationContext
	): TaskResult<void> => {
		return pipe(
			this.loginAttemptsRepository.get(userId, context),
			taskEither.chain((loginAttempts) => {
				if (!loginAttempts) {
					return this.loginAttemptsRepository.create(userId, context);
				} else {
					return taskEither.right(loginAttempts);
				}
			}),
			taskEither.chain((loginAttempts) =>
				this.loginAttemptsRepository.update(
					loginAttempts,
					loginAttempts.attempts + 1,
					context
				)
			),
			taskEither.chain((loginAttempts) => {
				if (loginAttempts > 3) {
					return taskEither.left(
						errorResults.locked(
							'User is locked. Too many login attempts'
						)
					);
				} else {
					return taskEither.right(void 0);
				}
			})
		);
	};

	postAuthentication = (
		userId: string,
		context: InvocationContext
	): TaskResult<void> => {
		return pipe(
			this.loginAttemptsRepository.get(userId, context),
			taskEither.chain((loginAttempts) => {
				if (!loginAttempts) {
					return this.loginAttemptsRepository.create(userId, context);
				} else {
					return taskEither.right(loginAttempts);
				}
			}),
			taskEither.chain((loginAttempts) =>
				this.loginAttemptsRepository.update(loginAttempts, 0, context)
			),
			taskEither.map(() => void 0)
		);
	};
}
