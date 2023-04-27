import { StackContext } from 'sst/constructs';
import createBankTable from '@resources/banks/banksTable';

export function DynamoDbStack({ stack }: StackContext) {
	const bankTable = createBankTable(stack);

	return { bankTable };
}
