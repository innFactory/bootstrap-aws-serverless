"use strict";
exports.__esModule = true;
var MyStack_1 = require("./MyStack");
function default_1(app) {
    app.setDefaultFunctionProps({
        runtime: "nodejs16.x",
        srcPath: "services",
        bundle: {
            format: "cjs"
        }
    });
    app.stack(MyStack_1.MyStack);
}
exports["default"] = default_1;
