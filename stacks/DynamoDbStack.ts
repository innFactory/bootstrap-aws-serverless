import { StackContext } from 'sst/constructs';
import createBankTable from '@resources/banks/banksTable';
import createLoginAttemptsTable from '@resources/auth/loginAttemptsTable';
import createMigrationsTable from '@resources/migrations/migrationsTable';

export function DynamoDbStack({ stack }: StackContext) {
	const bankTable = createBankTable(stack);
	const loginAttemptsTable = createLoginAttemptsTable(stack);
	const migrationsTable = createMigrationsTable(stack);

	return { bankTable, loginAttemptsTable, migrationsTable };
}
