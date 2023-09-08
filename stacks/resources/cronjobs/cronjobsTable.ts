import { Stack } from 'sst/constructs';
import { createEncryptedTable } from 'stacks/common/encryptedTable';

const createCronjobsTable = (stack: Stack) => {
	return createEncryptedTable(stack, 'cronjobs', {
		fields: {
			// Only add indexed fields
			id: 'string',
			createdAt: 'string',
		},
		primaryIndex: { partitionKey: 'id', sortKey: 'createdAt' },
	});
};

export default createCronjobsTable;
