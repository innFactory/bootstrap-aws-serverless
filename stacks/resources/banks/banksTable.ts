import { Stack, Table } from '@serverless-stack/resources';

const banksTable = (stack: Stack) => {
	return new Table(stack, 'banks', {
		fields: {
			id: 'string',
			name: 'string',
		},
		primaryIndex: { partitionKey: 'id' },
	});
};

export default banksTable;
