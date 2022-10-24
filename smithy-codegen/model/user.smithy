$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api
use smithy.framework#ValidationException


resource User {
    identifiers: {
        userId: UserId
    }
    properties: {
        name: String
        email: String
    }
    put: PutUser
    create: CreateUser
    read: GetUser
    update: UpdateUser
    delete: DeleteUser
    list: ListUsers
}

string UserId

@idempotent
@http(method: "PUT", uri: "/users")
operation PutUser {
    input: PutUserInput
    output: UserOutput
    errors: [ValidationException]
}

structure PutUserInput for User{
    @required
    $userId
}

@http(method: "POST", uri: "/users")
operation CreateUser {
    input: CreateUserInput
    output: UserOutput
    errors: [ValidationException]
}

structure CreateUserInput for User{
    @required
    $email
    @required
    $name
}

structure UserOutput for User {
    @required
    $userId
    @required
    $email
    @required
    $name
}

@readonly
@http(method: "GET", uri: "/users/{userId}")
operation GetUser {
    input: GetUserInput
    output: UserOutput
    errors: [ValidationException]
}

structure GetUserInput for User{
    @required
    @httpLabel
    $userId
}

@http(method: "UPDATE", uri: "/users")
operation UpdateUser {
    input: UpdateUserInput
    output: UserOutput
    errors: [ValidationException]
}

structure UpdateUserInput for User{
    @required
    $userId
}

@idempotent
@http(method: "DELETE", uri: "/users/{userId}")
operation DeleteUser {
    input: DeleteUserInput
    output: UserOutput
    errors: [ValidationException]
}

structure DeleteUserInput for User{
    @required
    @httpLabel
    $userId
}

@readonly
@http(method: "GET", uri: "/users")
operation ListUsers {
    output: ListUsersOutput
    errors: [ValidationException]  

}

structure ListUsersOutput {
    list: UserOutput 
}