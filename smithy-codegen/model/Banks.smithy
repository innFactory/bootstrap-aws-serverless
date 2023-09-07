$version: "2.0"
namespace de.innfactory.bootstrapawsserverless.api

resource Bank {
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

@http(method: "POST", uri: "/v1/banks")
operation CreateBankRequest {
    input: CreateBankInput
    output: BankOutput
    errors: [BadRequest]
}

structure CreateBankInput for Bank {
    @required
    $name
}

structure BankOutput for Bank {
    @required
    $id
    @required
    $name
}

@readonly
@http(method: "GET", uri: "/v1/banks/{id}")
operation GetBankRequest {
    input: GetBankInput
    output: BankOutput
    errors: [NotFound]
}

structure GetBankInput for Bank {
    @required
    @httpLabel
    $id
}

@http(method: "PATCH", uri: "/v1/banks")
operation UpdateBankRequest {
    input: UpdateBankInput
    output: BankOutput
    errors: [BadRequest, NotFound]
}

structure UpdateBankInput for Bank {
    @required
    $id
    $name
}

@idempotent
@http(method: "DELETE", uri: "/v1/banks/{id}")
operation DeleteBankRequest {
    input: DeleteBankInput
    output: BankOutput
    errors: [NotFound]
}

structure DeleteBankInput for Bank {
    @required
    @httpLabel
    $id
}

@readonly
@http(method: "GET", uri: "/v1/banks")
operation ListBanksRequest {
    input: BanksRequest
    output: BanksResponse
}

structure BanksRequest with [PaginatedInput] {
}

structure BanksResponse {
    items: BanksResponseList
    lastEvaluatedKey: String
}

list BanksResponseList {
    member: BankOutput
}