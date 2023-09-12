import { InvocationContext } from './invocationContext';

export interface InvocationContextWithUser extends InvocationContext {
	user: UserContext;
}

export interface UserContext {
	id: string;
}
