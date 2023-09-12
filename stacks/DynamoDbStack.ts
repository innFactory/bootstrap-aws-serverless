import { StackContext } from 'sst/constructs';
import createBankTable from '@resources/banks/table';
import createLoginAttemptsTable from '@resources/loginAttempts/table';
import createMigrationsTable from '@resources/migrations/table';

export function DynamoDbStack({ stack }: StackContext) {
	const bankTable = createBankTable(stack);
	const loginAttemptsTable = createLoginAttemptsTable(stack);
	const migrationsTable = createMigrationsTable(stack);

	return { bankTable, loginAttemptsTable, migrationsTable };
}
