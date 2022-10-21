$version: "2"
namespace de.innfactory.bootstrapawsserverless.api

/// For some reason, this service does not like palindromes!
@httpError(400)
@error("client")
structure PalindromeException {
    message: String,
}