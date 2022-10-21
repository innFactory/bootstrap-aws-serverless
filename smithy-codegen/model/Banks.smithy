$version: "2"
namespace de.innfactory.bootstrapawsserverless.api
use smithy.framework#ValidationException


resource Banks {
    identifiers: {
        id: BankId
    }
    properties: {
        name: String
    }
    create: CreateBankRequest
    read: GetBankRequest
    update: UpdateBankRequest
    delete: DeleteBankRequest
    list: ListBanksRequest
}

string BankId

@http(method: "POST", uri: "/banks")
operation CreateBankRequest {
    input: CreateBankInput
    output: Bank
    errors: [ValidationException]
}

structure CreateBankInput for Banks {
    @required
    $name
}

structure Bank for Banks {
    @required
    $id
    @required
    $name
}

@readonly
@http(method: "GET", uri: "/banks/{id}")
operation GetBankRequest {
    input: GetBankInput
    output: Bank
    errors: [ValidationException]
}

structure GetBankInput for Banks {
    @required
    @httpLabel
    $id
}

@http(method: "PATCH", uri: "/banks")
operation UpdateBankRequest {
    input: UpdateBankInput
    output: Bank
    errors: [ValidationException]
}

structure UpdateBankInput for Banks {
    @required
    $id
    $name
}

@idempotent
@http(method: "DELETE", uri: "/banks/{id}")
operation DeleteBankRequest {
    input: DeleteBankInput
    output: Bank
    errors: [ValidationException]
}

structure DeleteBankInput for Banks {
    @required
    @httpLabel
    $id
}

@readonly
@http(method: "GET", uri: "/banks")
operation ListBanksRequest {
    output: BanksResponse
    errors: [ValidationException]  

}

structure BanksResponse {
    body: BanksResponseList
}

list BanksResponseList {
    member: Bank
}