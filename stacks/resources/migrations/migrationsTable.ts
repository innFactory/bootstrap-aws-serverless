import { Stack } from 'sst/constructs';

import { createEncryptedTable } from 'stacks/common/encryptedTable';

const createMigrationsTable = (stack: Stack) => {
	return createEncryptedTable(stack, 'migrations', {
		fields: {
			id: 'number',
			status: 'string',
			startedAt: 'string',
		},
		primaryIndex: { partitionKey: 'id' },
		globalIndexes: {
			statusIndex: {
				partitionKey: 'status',
				sortKey: 'id',
			},
		},
	});
};

export default createMigrationsTable;
