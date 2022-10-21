import { Stack, Table } from '@serverless-stack/resources';

const banksTable = (stack: Stack) =>
	new Table(stack, 'Notes', {
		fields: {
			id: 'string',
			name: 'string',
		},
		primaryIndex: { partitionKey: 'id' },
	});

export default banksTable;
