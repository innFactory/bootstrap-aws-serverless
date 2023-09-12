import { KeysStack } from 'stacks/KeysStack';
import { StackContext, use } from 'sst/constructs';
import { createDefaultFunction } from 'stacks/common/defaultFunction';
import { DynamoDbStack } from 'stacks/DynamoDbStack';

export const getBank = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { bankTable } = use(DynamoDbStack);

	return createDefaultFunction(context, 'get-bank', {
		handler: 'services/functions/banks/application/handler/get.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [bankTable],
	});
};

export const getBanks = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { bankTable } = use(DynamoDbStack);

	return createDefaultFunction(context, 'get-banks', {
		handler: 'services/functions/banks/application/handler/list.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [bankTable],
	});
};

export const createBank = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { bankTable } = use(DynamoDbStack);

	return createDefaultFunction(context, 'create-bank', {
		handler: 'services/functions/banks/application/handler/create.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [bankTable],
	});
};

export const updateBank = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { bankTable } = use(DynamoDbStack);

	return createDefaultFunction(context, 'update-bank', {
		handler: 'services/functions/banks/application/handler/update.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [bankTable],
	});
};

export const deleteBank = (context: StackContext) => {
	const { withDynamoDBKeyPolicy } = use(KeysStack);
	const { bankTable } = use(DynamoDbStack);

	return createDefaultFunction(context, 'delete-bank', {
		handler: 'services/functions/banks/application/handler/delete.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy([]),
		bind: [bankTable],
	});
};
