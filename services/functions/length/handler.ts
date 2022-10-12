import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as API from "../../codegen";
import { LengthOperation } from "./operation";
import { getApiGatewayHandler } from "utils/apiGatewayHandler";

export const lambdaHandler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
  API.getLengthHandler(LengthOperation)
);
