"use strict";
exports.__esModule = true;
exports.MyStack = void 0;
var resources_1 = require("@serverless-stack/resources");
function MyStack(_a) {
    var stack = _a.stack;
    var api = new resources_1.Api(stack, "api", {
        routes: {
            "GET /": "functions/lambda.handler",
            "GET /length/{message}": "functions/length/handler.lambdaHandler",
            "POST /echo": "functions/echo/handler.lambdaHandler"
        }
    });
    stack.addOutputs({
        ApiEndpoint: api.url
    });
}
exports.MyStack = MyStack;
