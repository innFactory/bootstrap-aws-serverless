import { TABLE_KEYS } from '@common/dynamodb/tableKeys';
import { Stack, Table } from 'sst/constructs';

const banksTable = (stack: Stack) => {
	return new Table(stack, TABLE_KEYS.BANKS_TABLE, {
		fields: {
			id: 'string',
			name: 'string',
		},
		primaryIndex: { partitionKey: 'id' },
	});
};

export default banksTable;
