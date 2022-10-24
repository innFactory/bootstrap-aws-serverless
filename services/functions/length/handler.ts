import { Operation } from '@aws-smithy/server-common';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getLengthHandler, LengthServerInput, LengthServerOutput } from '@api';
import {
	getApiGatewayHandler,
	HandlerContext,
} from 'services/common/apiGatewayHandler';

const LengthOperation: Operation<
	LengthServerInput,
	LengthServerOutput,
	HandlerContext
> = async (input, context) => {
	console.log(`Received Length operation from: ${context.user}`);

	return {
		length: input.message?.length,
	};
};

export const lambdaHandler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
	getLengthHandler(LengthOperation)
);
