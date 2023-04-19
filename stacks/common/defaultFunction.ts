import { FunctionProps, Function, StackContext } from 'sst/constructs';
import { isDeployedStage } from './isOfStage';

export const createDefaultFunction = (
	context: StackContext,
	id: string,
	props: FunctionProps
) =>
	new Function(context.stack, id, {
		timeout: '30 seconds',
		logRetention: isDeployedStage(context.stack.stage)
			? undefined
			: 'two_weeks',
		...props,
	});
