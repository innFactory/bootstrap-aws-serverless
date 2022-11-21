import { InvocationContext } from './invocationContext';

export interface InvocationContextWithUser extends InvocationContext {
	user: {
		name: string;
		bankId: string;
	};
}
