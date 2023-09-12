export interface User {
	id: string;
	email: string;
	status?: 'FORCE_CHANGE_PASSWORD' | string;
}

export interface PaginatedUsers {
	users: User[];
	lastEvaluatedKey?: string;
}
