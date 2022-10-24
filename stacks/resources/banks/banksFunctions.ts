import { StackContext, Function, use } from '@serverless-stack/resources';
import { DynamoDbStack } from 'stacks/DynamoDbStack';

export const getBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'GetBank', {
		handler: 'functions/banks/application/handler/get.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: [bankTable],
	});
};

export const getBanks = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'GetBanks', {
		handler: 'functions/banks/application/handler/list.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: [bankTable],
	});
};

export const createBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'CreateBank', {
		handler: 'functions/banks/application/handler/create.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: [bankTable],
	});
};

export const updateBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'UpdateBank', {
		handler: 'functions/banks/application/handler/update.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: [bankTable],
	});
};

export const deleteBank = (context: StackContext) => {
	const { bankTable } = use(DynamoDbStack);

	return new Function(context.stack, 'DeleteBank', {
		handler: 'functions/banks/application/handler/delete.handler',
		environment: {
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: [bankTable],
	});
};
