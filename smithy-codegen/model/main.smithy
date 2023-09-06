$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api
use aws.auth#sigv4
use aws.protocols#restJson1
use smithy.framework#ValidationException

@title("bootstrap-aws-serverless-api")
@sigv4(name: "execute-api")
@httpBearerAuth
@restJson1
@auth([httpBearerAuth])
service Api {
    version: "0.0.1",
    resources: [Bank, User]
    operations: [GetUserByMailRequest, TriggerMigrations]
    errors: [ValidationException, InternalServerError, NotFound, BadRequest, Unauthorized, Forbidden]
}



