$version: "2.0"

namespace de.innfactory.bootstrapawsserverless.api

@error("server")
@httpError(500)
structure InternalServerError {
    @required
    message: String,
}

@error("client")
@httpError(400)
structure BadRequest {
    @required
    message: String,
}

@error("client")
@httpError(404)
structure NotFound {
    @required
    message: String,
}

@error("client")
@httpError(401)
structure Unauthorized {
    @required
    message: String,
}

@error("client")
@httpError(403)
structure Forbidden {
    @required
    message: String,
}
