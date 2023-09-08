import {
	Cronjob,
	CronjobDDB,
	CronjobDetails,
} from '@functions/cronjobs/domain/models/cronjob';

export const mapCronjobDDBToDomain = <
	CronjobId extends string,
	Details extends CronjobDetails
>(
	job: CronjobDDB
): Cronjob<CronjobId, Details> => ({
	id: job.id as CronjobId,
	createdAt: job.createdAt,
	details: JSON.parse(job.details) as Details,
	finishedAt: job.finishedAt,
	status: job.status,
});
