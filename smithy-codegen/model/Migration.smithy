$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api
use smithy.framework#ValidationException

@http(method: "POST", uri: "/v1/migrations", code: 204)
operation TriggerMigrations {
     errors: [ValidationException]
}