const INJECTABLES = {
	BankService: Symbol.for('BankService'),
	BankRepository: Symbol.for('BankRepository'),

	DynamoDBRepository: Symbol.for('DynamoDBRepository'),

	LoginAttemptsService: Symbol.for('LoginAttemptsService'),
	LoginAttemptsRepository: Symbol.for('LoginAttemptsRepository'),

	UserService: Symbol.for('UserService'),
	UserRepository: Symbol.for('UserRepository'),
};

export { INJECTABLES };
