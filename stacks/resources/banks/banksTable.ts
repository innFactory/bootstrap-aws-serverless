import { Stack } from 'sst/constructs';
import { createEncryptedTable } from 'stacks/common/encryptedTable';

const createBankTable = (stack: Stack) => {
	return createEncryptedTable(stack, 'banks', {
		fields: {
			// Only add indexed fields
			id: 'string',
		},
		primaryIndex: { partitionKey: 'id' },
	});
};

export default createBankTable;
