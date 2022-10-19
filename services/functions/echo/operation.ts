import { Operation } from "@aws-smithy/server-common";
import { EchoServerInput, EchoServerOutput, PalindromeException } from "@api";
import { HandlerContext } from "../../utils/apiGatewayHandler";

export const EchoOperation: Operation<
  EchoServerInput,
  EchoServerOutput,
  HandlerContext
> = async (input, context) => {
  console.log(`Received Echo operation from: ${context.user}`);

  if (input.message != undefined && input.message === reverse(input.message)) {
    throw new PalindromeException({
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
