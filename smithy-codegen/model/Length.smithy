$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api

use smithy.framework#ValidationException
/// Length operation that receives input from path.
@readonly
@http(code: 200, method: "GET", uri: "/length/{message}",)
operation Length {
    input: LengthInput,
    output: LengthOutput,
    errors: [ValidationException],
}


structure LengthInput {
    @required
    @httpLabel
    message: String,
}

structure LengthOutput {
    length: Integer,
}
