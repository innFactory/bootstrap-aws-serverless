import { StackContext, Function } from '@serverless-stack/resources';
import { isTestStage } from 'stacks/common/isOfStage';

export const authorizer = (context: StackContext) => {
	return new Function(context.stack, 'DefaultAuthorizer', {
		handler: isTestStage(context.stack.stage)
			? 'functions/authorization/application/handler/mockedAuthorizer.handler'
			: 'functions/authorization/application/handler/authorizer.handler',
	});
};
