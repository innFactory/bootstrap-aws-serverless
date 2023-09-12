import { Stack } from 'sst/constructs';

import { createEncryptedTable } from 'stacks/common/encryptedTable';

const createLoginAttemptsTable = (stack: Stack) => {
	return createEncryptedTable(stack, 'loginAttempts', {
		fields: {
			// Only add indexed fields
			userId: 'string',
		},
		primaryIndex: { partitionKey: 'userId' },
	});
};

export default createLoginAttemptsTable;
