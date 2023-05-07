import { FunctionDefinition, StackContext } from 'sst/constructs';
import { defaultFunctionProps } from 'stacks/common/defaultFunction';

export const createAlarmPublisherFunction = (
	context: StackContext
): FunctionDefinition => ({
	...defaultFunctionProps(context),
	timeout: '5 minutes',
	handler: 'services/functions/alarms/publisher.handler',
	permissions: ['secretsmanager'],
});
