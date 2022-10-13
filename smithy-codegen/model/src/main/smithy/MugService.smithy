namespace de.innfactory.gen

use aws.auth#sigv4
use aws.protocols#restJson1

use smithy.framework#ValidationException



@readonly
@http(code: 200, method: "GET", uri: "/mug",)
operation GetRandomMug {
    output: GetRandomMugOutput,
    errors: [ValidationException]
}

structure GetRandomMugOutput {
    @httpPayload
    @required
    body: Mug
}

structure Mug {
    @required
    name: String,
    @required
    description: String,
    @required
    image: String
}