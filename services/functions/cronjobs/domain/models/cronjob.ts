import { DDBKey } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';

export interface Cronjob<
	Id extends '' | string,
	Details extends DetailsWithVersion
> {
	id: Id;
	status: 'ERROR' | 'SUCCESS' | 'PARTIAL_ERROR' | 'IN_PROGRESS';
	details: Details;
	createdAt: string;
	finishedAt: string | undefined;
}

export type CronjobDetails = { [key: string]: unknown } & DetailsWithVersion;

export interface DetailsWithVersion {
	version: number;
}

export type CronjobDDB = Omit<Cronjob<string, CronjobDetails>, 'details'> & {
	details: string;
};
export type CronjobDDBItem = Omit<CronjobDDB, 'id' | 'createdAt'> & {
	id: DDBKey<string>;
	createdAt: DDBKey<string>;
};

export interface PaginatedCronjobs<
	CronjobId extends string,
	CronjobDetails extends DetailsWithVersion
> {
	items: Cronjob<CronjobId, CronjobDetails>[];
	lastEvaluatedKey: string | undefined;
}
