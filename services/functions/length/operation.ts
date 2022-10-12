import { Operation } from "@aws-smithy/server-common";
import * as API from "../../codegen";
import { HandlerContext } from "utils/apiGatewayHandler";

export const LengthOperation: Operation<
  API.LengthServerInput,
  API.LengthServerOutput,
  HandlerContext
> = async (input, context) => {
  console.log(`Received Length operation from: ${context.user}`);

  if (input.message != undefined && input.message === reverse(input.message)) {
    throw new API.PalindromeException({
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
