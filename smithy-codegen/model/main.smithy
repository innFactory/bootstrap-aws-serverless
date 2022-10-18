$version: "2"
namespace de.innfactory.gen
use aws.auth#sigv4
use aws.protocols#restJson1
use smithy.framework#ValidationException

@title("A magical string manipulation service")

// Cross-origin resource sharing allows resources to be requested from external domains.
// Cors should be enabled for externally facing services and disabled for internally facing services.
// Enabling cors will modify the OpenAPI spec used to define your API Gateway endpoint.
// Uncomment the line below to enable cross-origin resource sharing
// @cors()

@sigv4(name: "execute-api")
@restJson1
service StringWizard {
    version: "2018-05-10",
    resources: [User]
    operations: [Echo, Length, GetRandomMug],
}


