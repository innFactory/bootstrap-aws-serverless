import { StackContext, Function } from '@serverless-stack/resources';

export const getBank = (context: StackContext) =>
	new Function(context.stack, 'GetBank', {
		handler: 'functions/banks/application/handler/get.handler',
	});

export const getBanks = (context: StackContext) =>
	new Function(context.stack, 'GetBanks', {
		handler: 'functions/banks/application/handler/list.handler',
	});

export const createBank = (context: StackContext) =>
	new Function(context.stack, 'CreateBank', {
		handler: 'functions/banks/application/handler/create.handler',
	});

export const updateBank = (context: StackContext) =>
	new Function(context.stack, 'UpdateBank', {
		handler: 'functions/banks/application/handler/update.handler',
	});

export const deleteBank = (context: StackContext) =>
	new Function(context.stack, 'DeleteBank', {
		handler: 'functions/banks/application/handler/delete.handler',
	});
