const INJECTABLES = {
	DynamoDBRepository: Symbol.for('DynamoDBRepository'),
	BankService: Symbol.for('BankService'),
	BankRepository: Symbol.for('BankRepository'),
};

export { INJECTABLES };
