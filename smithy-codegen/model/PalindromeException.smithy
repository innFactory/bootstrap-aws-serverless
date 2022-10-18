$version: "2"
namespace de.innfactory.gen

/// For some reason, this service does not like palindromes!
@httpError(400)
@error("client")
structure PalindromeException {
    message: String,
}