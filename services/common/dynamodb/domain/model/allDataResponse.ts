export interface AllDataResponse<T> {
	items: T[];
	lastEvaluatedKey: string | undefined;
}
