import { StackContext, Function, use } from 'sst/constructs';
import { DynamoDbStack } from 'stacks/DynamoDbStack';

export const getBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'GetBank', {
		handler: 'services/functions/banks/application/handler/get.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		bind: [bankTable],
	});
};

export const getBanks = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'GetBanks', {
		handler: 'services/functions/banks/application/handler/list.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		bind: [bankTable],
	});
};

export const createBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'CreateBank', {
		handler: 'services/functions/banks/application/handler/create.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		bind: [bankTable],
	});
};

export const updateBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'UpdateBank', {
		handler: 'services/functions/banks/application/handler/update.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		bind: [bankTable],
	});
};

export const deleteBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'DeleteBank', {
		handler: 'services/functions/banks/application/handler/delete.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		bind: [bankTable],
	});
};
