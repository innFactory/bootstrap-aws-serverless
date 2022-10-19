import { Operation } from "@aws-smithy/server-common";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  getLengthHandler,
  LengthServerInput,
  LengthServerOutput,
  PalindromeException,
} from "@api";
import { getApiGatewayHandler, HandlerContext } from "@utils/apiGatewayHandler";

const LengthOperation: Operation<
  LengthServerInput,
  LengthServerOutput,
  HandlerContext
> = async (input, context) => {
  console.log(`Received Length operation from: ${context.user}`);

  if (input.message != undefined && input.message === reverse(input.message)) {
    throw new PalindromeException({
      message: "Cannot handle palindrome",
    });
  }

  return {
    length: input.message?.length,
  };
};

function reverse(str: string) {
  return str.split("").reverse().join("");
}

export const lambdaHandler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
  getLengthHandler(LengthOperation)
);
