import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import {
  convertEvent,
  convertVersion2Response,
} from "@aws-smithy/server-apigateway";
import { ServiceHandler } from "@aws-smithy/server-common";

export interface HandlerContext {
  user: string;
}

export function getApiGatewayHandler(
  handler: ServiceHandler<HandlerContext>
): APIGatewayProxyHandlerV2 {
  return async (
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> => {
    // Extract anything from the APIGateway requestContext that you'd need in your operation handler
    const userArn = event.requestContext.accountId;
    if (!userArn) {
      throw new Error("IAM Auth is not enabled");
    }
    const context = { user: userArn };

    const httpRequest = convertEvent(event);
    const httpResponse = await handler.handle(httpRequest, context);
    return convertVersion2Response(httpResponse);
  };
}
