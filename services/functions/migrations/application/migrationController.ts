import {
	TriggerMigrationsServerInput,
	TriggerMigrationsServerOutput,
} from '@api';
import { Operation } from '@aws-smithy/server-common';
import { BaseController } from '@common/application/baseController';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { lazyInject } from '@common/injection/decorator';
import { INJECTABLES } from '@common/injection/injectables';
import { MigrationService } from '../domain/interfaces/migrationService';
import { prettyPrint } from '@common/logging/prettyPrint';
import { pipe } from 'fp-ts/lib/function';
import { taskEither } from 'fp-ts';

class MigrationController extends BaseController {
	@lazyInject(INJECTABLES.MigrationService)
	private migrationService!: MigrationService;

	public trigger: Operation<
		TriggerMigrationsServerInput,
		TriggerMigrationsServerOutput,
		InvocationContext
	> = async (input, context) => {
		const { logger } = context;
		logger.addContext(context);
		logger.logEventIfEnabled(prettyPrint(input));

		return pipe(
			this.migrationService.triggerMigrations(context),
			taskEither.map(() => ({})),
			this.throwOnLeft(logger)
		);
	};
}

export const migrationController = new MigrationController();
