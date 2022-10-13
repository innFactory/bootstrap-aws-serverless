import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { LengthOperation } from "./operation";
import { getApiGatewayHandler } from "utils/apiGatewayHandler";
import { getLengthHandler } from "smithy-api-typescript-gen";

export const lambdaHandler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
  getLengthHandler(LengthOperation)
);
