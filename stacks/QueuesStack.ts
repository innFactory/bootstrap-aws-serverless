import { createDeleteUserQueues } from '@resources/users/queues';
import { StackContext } from 'sst/constructs';

export const QueuesStack = (context: StackContext) => {
	const deleteUserQueues = createDeleteUserQueues(context);

	return {
		deleteUserQueues,
	};
};
