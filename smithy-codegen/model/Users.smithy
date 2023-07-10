$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api
use smithy.framework#ValidationException


resource User {
    identifiers: {
        id: UserId
    }
    properties: {
        email: String
        password: Password
    }
    create: CreateUserRequest
    read: GetUserRequest
    delete: DeleteUserRequest
    operations: [UpdatePasswordRequest]
}

string UserId

@pattern("^.{10,}$")
@documentation("Password")
string Password

@http(method: "POST", uri: "/v1/users")
operation CreateUserRequest {
    input: CreateUserInput
    output: UserOutput
    errors: [ValidationException, BadRequest]
}

structure CreateUserInput for User {
    @required
    $email
    @required
    $password
}

structure UserOutput for User {
    @required
    $id
    @required
    $email
}

@readonly
@http(method: "GET", uri: "/v1/users/{id}")
operation GetUserRequest {
    input: GetUserInput
    output: UserOutput
    errors: [ValidationException, NotFound]
}

structure GetUserInput for User {
    @required
    @httpLabel
    $id
}

@readonly
@http(method: "GET", uri: "/v1/emails/{email}/users")
operation GetUserByMailRequest {
    input: GetUserByMailInput
    output: UserOutput
    errors: [ValidationException, NotFound]
}

structure GetUserByMailInput {
    @required
    @httpLabel
    email: String
}

@http(method: "PATCH", uri: "/v1/users/{id}/password", code: 204)
operation UpdatePasswordRequest {
    input: UpdatePasswordInput
    errors: [ValidationException, BadRequest, NotFound]
}

structure UpdatePasswordInput for User {
    @required
    @httpLabel
    $id
    @required
    $password
}

@idempotent
@http(method: "DELETE", uri: "/v1/users/{id}", code: 204)
operation DeleteUserRequest {
    input: DeleteUserInput
    errors: [ValidationException, NotFound]
}

structure DeleteUserInput for User {
    @required
    @httpLabel
    $id
}