import { FunctionDefinition, StackContext } from 'sst/constructs';
import {
	defaultFunctionName,
	defaultFunctionProps,
} from 'stacks/common/defaultFunction';

export const createAlarmPublisherFunction = (
	context: StackContext
): FunctionDefinition => ({
	...defaultFunctionProps(context),
	functionName: defaultFunctionName(context, 'alarm-publisher'),
	timeout: '90 seconds',
	handler: 'services/functions/alarms/publisher.handler',
	permissions: ['secretsmanager'],
});
