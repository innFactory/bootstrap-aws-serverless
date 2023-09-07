import { InvocationContext } from '@common/gateway/model/invocationContext';
import { TaskResult } from '@common/results/taskResult';

export type Job = (context: InvocationContext) => TaskResult<void>;

export interface MigrationJob {
	id: number;
	migration: Job;
}
