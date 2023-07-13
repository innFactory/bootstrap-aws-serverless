import { createDeleteUserQueues } from '@resources/queues/deleteUserQueues';
import { StackContext } from 'sst/constructs';

export const QueuesStack = (context: StackContext) => {
	const deleteUserQueues = createDeleteUserQueues(context);

	return {
		deleteUserQueues,
	};
};
