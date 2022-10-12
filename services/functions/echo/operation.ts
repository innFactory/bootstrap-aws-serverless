import { Operation } from "@aws-smithy/server-common";
import { HandlerContext } from "../../utils/apiGatewayHandler";
import * as API from "../../codegen";

export const EchoOperation: Operation<
  API.EchoServerInput,
  API.EchoServerOutput,
  HandlerContext
> = async (input, context) => {
  console.log(`Received Echo operation from: ${context.user}`);

  if (input.message != undefined && input.message === reverse(input.message)) {
    throw new API.PalindromeException({
      message: "Cannot handle palindrome",
    });
  }

  return {
    message: input.message,
  };
};

export function reverse(str: string) {
  return str.split("").reverse().join("");
}
