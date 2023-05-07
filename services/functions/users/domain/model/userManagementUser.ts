export interface UserManagementUser {
	id: string;
	email: string;
	status?: 'FORCE_CHANGE_PASSWORD' | string;
}
