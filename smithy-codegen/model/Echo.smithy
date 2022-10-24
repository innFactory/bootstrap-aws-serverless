$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api

use smithy.framework#ValidationException

/// Echo operation that receives input from body.

@http(code: 200, method: "POST", uri: "/echo",)
operation Echo {
    input: EchoInput,
    output: EchoOutput,
    errors: [ValidationException],
}

structure EchoInput {
    message: String,
}

structure EchoOutput {
    message: String,
}
