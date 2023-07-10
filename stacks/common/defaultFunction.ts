import { FunctionProps, Function, StackContext } from 'sst/constructs';
import { isDeployedStage } from './isOfStage';

export const createDefaultFunction = (
	context: StackContext,
	id: string,
	props: FunctionProps
) =>
	new Function(context.stack, id, {
		functionName: defaultFunctionName(context, id),
		...defaultFunctionProps(context),
		...props,
	});

export const defaultFunctionProps = (context: StackContext): FunctionProps => ({
	timeout: '30 seconds',
	logRetention: isDeployedStage(context.stack.stage)
		? undefined
		: 'two_weeks',
});

export const defaultFunctionName = (context: StackContext, id: string) =>
	`${context.stack.stage}-${context.app.name}-${id}`;
