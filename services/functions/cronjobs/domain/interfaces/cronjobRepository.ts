import { InvocationContext } from '@common/gateway/model/invocationContext';
import { Cronjob, CronjobDetails, PaginatedCronjobs } from '../models/cronjob';
import { TaskResult } from '@common/results/taskResult';

export interface CronjobRepository {
	upsert<CronjobId extends string, Details extends CronjobDetails>(
		cronjob: Cronjob<CronjobId, Details>,
		context: InvocationContext
	): TaskResult<Cronjob<CronjobId, Details>>;

	get<CronjobId extends string, Details extends CronjobDetails>(
		cronjobId: CronjobId,
		createdAt: string,
		context: InvocationContext
	): TaskResult<Cronjob<CronjobId, Details>>;

	getOptional<CronjobId extends string, Details extends CronjobDetails>(
		cronjobId: CronjobId,
		createdAt: string,
		context: InvocationContext
	): TaskResult<Cronjob<CronjobId, Details> | undefined>;

	list<CronjobId extends string, Details extends CronjobDetails>(
		cronjobId: CronjobId,
		queryAll: boolean | undefined,
		lastEvaluatedKey: string | undefined,
		limit: number | undefined,
		context: InvocationContext
	): TaskResult<PaginatedCronjobs<CronjobId, Details>>;
}
