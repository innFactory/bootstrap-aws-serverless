import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as API from "@smithy-demo/string-wizard-service-ssdk";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const value: undefined | API.EchoServerInput = undefined;
  console.log("Hi");
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, World! Your request was received at ${event.requestContext.time}.`,
  };
};

/**
 * Given a ServiceHandler, returns an APIGatewayProxyHandler that knows how to:
 * 1. convert the APIGateway request (APIGatewayProxyEvent) into inputs for the ServiceHandler
 * 2. invoke the ServiceHandler
 * 3. convert the output of ServiceHandler into the result (APIGatewayProxyResult) expected by APIGateway
 */
