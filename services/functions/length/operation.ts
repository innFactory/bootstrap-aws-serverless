import { Operation } from "@aws-smithy/server-common";
import {
  LengthServerInput,
  LengthServerOutput,
  PalindromeException,
} from "smithy-api-typescript-gen";
import { HandlerContext } from "utils/apiGatewayHandler";

export const LengthOperation: Operation<
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

export function reverse(str: string) {
  return str.split("").reverse().join("");
}
