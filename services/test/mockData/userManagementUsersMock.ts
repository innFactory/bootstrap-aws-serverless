import { User } from '@functions/users/domain/model/user';

export const unverifiedManagementUser: User = {
	email: 'test@innfactory.de',
	id: '32db6a66-8154-4aa2-be47-08c2a481db91',
	status: 'FORCE_CHANGE_PASSWORD',
};

export const userManagementUsers: {
	[partnerId: string]: User[];
} = {};
userManagementUsers['example'] = [unverifiedManagementUser];
