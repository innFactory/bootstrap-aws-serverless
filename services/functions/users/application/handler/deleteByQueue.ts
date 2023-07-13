import { InvocationContext } from '@common/gateway/model/invocationContext';
import { lazyInject } from '@common/injection/decorator';
import { INJECTABLES } from '@common/injection/injectables';
import { prettyPrint } from '@common/logging/prettyPrint';
import { ErrorResult } from '@common/results/errorResult';
import { SQSController } from '@common/sqs/application/sqsController';
import { UserService } from '@functions/users/domain/interfaces/userService';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

export interface UserMessage {
	userId: string;
	instanceId: string;
}

class DeleteByQueueController extends SQSController<UserMessage> {
	@lazyInject(INJECTABLES.UserService)
	private userService!: UserService;

	protected identifier: string = DeleteByQueueController.name;
	protected handleMessage(
		message: UserMessage,
		context: InvocationContext
	): taskEither.TaskEither<ErrorResult, void> {
		const { logger } = context;
		logger.addContext(context);
		logger.logEventIfEnabled(prettyPrint(message));

		return pipe(
			this.userService.delete(
				message.userId,
				message.instanceId,
				context
			),
			taskEither.mapLeft((error) => {
				logger.warn(
					'Failed to delete user',
					`userId: ${message.userId}, instanceId: ${
						message.instanceId
					}, cause: ${error.statusCode} - ${prettyPrint(error.body)}`
				);
				return error;
			})
		);
	}
}

const deleteByQueueController = new DeleteByQueueController();

export const handler = deleteByQueueController.handler;
