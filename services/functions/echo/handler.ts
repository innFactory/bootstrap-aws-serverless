import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getApiGatewayHandler } from "utils/apiGatewayHandler";
import { EchoOperation } from "./operation";
import * as API from "../../codegen";

export const lambdaHandler: APIGatewayProxyHandlerV2 = getApiGatewayHandler(
  API.getEchoHandler(EchoOperation)
);
