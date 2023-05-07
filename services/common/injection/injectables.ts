const INJECTABLES = {
	BankService: Symbol.for('BankService'),
	BankRepository: Symbol.for('BankRepository'),

	DynamoDBRepository: Symbol.for('DynamoDBRepository'),

	LoginAttemptsService: Symbol.for('LoginAttemptsService'),
	LoginAttemptsRepository: Symbol.for('LoginAttemptsRepository'),

	UserManagementRepository: Symbol.for('UserManagementRepository'),
};

export { INJECTABLES };
