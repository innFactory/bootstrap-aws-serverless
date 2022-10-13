"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MyStack_1 = require("./MyStack");
function default_1(app) {
    app.setDefaultFunctionProps({
        runtime: "nodejs16.x",
        srcPath: "services",
        bundle: {
            nodeModules: ["re2-wasm"],
            format: "cjs",
        },
    });
    app.stack(MyStack_1.MyStack);
}
exports.default = default_1;
