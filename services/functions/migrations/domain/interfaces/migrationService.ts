import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';

export interface MigrationService {
	triggerMigrations(context: InvocationContext): TaskResult<void>;
}
