export interface User {
	id: string;
	email: string;
	status?: 'FORCE_CHANGE_PASSWORD' | string;
}
