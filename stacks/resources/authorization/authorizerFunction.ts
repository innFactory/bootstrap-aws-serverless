import { StackContext, Function } from '@serverless-stack/resources';

export const authorizer = (context: StackContext) => {
	return new Function(context.stack, 'EuropaceAuthorizer', {
		handler:
			context.stack.stage === 'test'
				? 'functions/authorization/application/handler/mockedAuthorizer.handler'
				: 'functions/authorization/application/handler/authorizer.handler',
	});
};
