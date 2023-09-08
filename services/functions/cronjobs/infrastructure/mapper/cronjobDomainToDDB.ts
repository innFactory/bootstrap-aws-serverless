import { DDBKey } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import {
	Cronjob,
	CronjobDDBItem,
	DetailsWithVersion,
} from '@functions/cronjobs/domain/models/cronjob';

export const mapCronjobToDDBItem = (
	cronjob: Cronjob<string, DetailsWithVersion>
): CronjobDDBItem => ({
	id: new DDBKey(cronjob.id),
	createdAt: new DDBKey(cronjob.createdAt),
	finishedAt: cronjob.finishedAt,
	details: JSON.stringify(cronjob.details),
	status: cronjob.status,
});
