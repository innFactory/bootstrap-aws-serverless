$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api

@mixin
structure PaginatedInput {
    @httpQuery("queryAll")
    queryAll: Boolean
    @httpQuery("limit")
    limit: Integer
    @httpQuery("lastEvaluatedKey")
    lastEvaluatedKey: String
}

@pattern("^\\d{4}-\\d{2}-\\d{2}$")
@documentation("ISO Date")
string Date


@pattern("^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(\\.\\d+)?(([+-]\\d\\d:\\d\\d)|Z)?$")
@documentation("ISO Date With Time")
string DateWithTime