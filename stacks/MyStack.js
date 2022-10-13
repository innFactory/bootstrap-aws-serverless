"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyStack = void 0;
const resources_1 = require("@serverless-stack/resources");
function MyStack({ stack }) {
    const api = new resources_1.Api(stack, "api", {
        routes: {
            "GET /": "functions/lambda.handler",
            "GET /length/{message}": "functions/length/handler.lambdaHandler",
            "POST /echo": "functions/echo/handler.lambdaHandler",
        },
    });
    stack.addOutputs({
        ApiEndpoint: api.url,
    });
}
exports.MyStack = MyStack;
