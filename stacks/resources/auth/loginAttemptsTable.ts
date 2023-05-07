import { Stack } from 'sst/constructs';

import { createEncryptedTable } from 'stacks/common/encryptedTable';

const createLoginAttemptsTable = (stack: Stack) => {
	return createEncryptedTable(stack, 'loginAttempts', {
		fields: {
			userId: 'string',
			partnerId: 'string',
			attempts: 'number',
			createdAt: 'string',
			updatedAt: 'string',
		},
		primaryIndex: { partitionKey: 'userId', sortKey: 'partnerId' },
	});
};

export default createLoginAttemptsTable;
