import { StackContext } from 'sst/constructs';
import createBankTable from '@resources/banks/banksTable';
import createLoginAttemptsTable from '@resources/auth/loginAttemptsTable';

export function DynamoDbStack({ stack }: StackContext) {
	const bankTable = createBankTable(stack);
	const loginAttemptsTable = createLoginAttemptsTable(stack);

	return { bankTable, loginAttemptsTable };
}
