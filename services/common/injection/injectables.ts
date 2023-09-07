const INJECTABLES = {
	BankService: Symbol.for('BankService'),
	BankRepository: Symbol.for('BankRepository'),

	DynamoDBRepository: Symbol.for('DynamoDBRepository'),

	SecretManagerRepository: Symbol.for('SecretManagerRepository'),
	S3Repository: Symbol.for('S3Repository'),

	LoginAttemptsService: Symbol.for('LoginAttemptsService'),
	LoginAttemptsRepository: Symbol.for('LoginAttemptsRepository'),

	MigrationService: Symbol.for('MigrationService'),
	MigrationRepository: Symbol.for('MigrationRepository'),

	UserService: Symbol.for('UserService'),
	UserRepository: Symbol.for('UserRepository'),
};

export { INJECTABLES };
