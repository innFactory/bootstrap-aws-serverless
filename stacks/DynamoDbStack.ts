import { StackContext } from '@serverless-stack/resources';
import createBankTable from '@resources/banks/banksTable';

export function DynamoDbStack({ stack }: StackContext) {
	const bankTable = createBankTable(stack);

	return { bankTable };
}
