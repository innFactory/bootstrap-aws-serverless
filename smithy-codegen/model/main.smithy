$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api
use aws.auth#sigv4
use aws.protocols#restJson1
use smithy.framework#ValidationException

@title("bootstrap-aws-serverless-api")
@sigv4(name: "execute-api")
@restJson1
service Api {
    version: "2018-05-10",
    resources: [Banks]
    errors: [InternalServerError]
}


