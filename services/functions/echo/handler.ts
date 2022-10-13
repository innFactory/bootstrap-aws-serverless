import { getEchoHandler } from "smithy-api-typescript-gen";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getApiGatewayHandler } from "utils/apiGatewayHandler";
import { EchoOperation } from "./operation";

export const lambdaHandler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
  getEchoHandler(EchoOperation)
);
