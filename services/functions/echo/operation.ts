import { Operation } from '@aws-smithy/server-common';
import { EchoServerInput, EchoServerOutput } from '@api';
import { HandlerContext } from '../../common/apiGatewayHandler';

export const EchoOperation: Operation<
	EchoServerInput,
	EchoServerOutput,
	HandlerContext
> = async (input, context) => {
	console.log(`Received Echo operation from: ${context.user}`);

	return {
		message: input.message,
	};
};

export function reverse(str: string) {
	return str.split('').reverse().join('');
}
