import { KeysStack } from '@resources/keys/keysStack';
import { Table, TableProps, use } from 'sst/constructs';
import { TableProps as CdkTableProps } from 'aws-cdk-lib/aws-dynamodb';
import { TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { Stack } from 'sst/constructs';

export const createEncryptedTable = (
	scope: Stack,
	id: string,
	props: TableProps
) => {
	const { dynamoDBKey } = use(KeysStack);
	const encryption: Pick<CdkTableProps, 'encryption' | 'encryptionKey'> =
		dynamoDBKey
			? {
					encryption: TableEncryption.CUSTOMER_MANAGED,
					encryptionKey: dynamoDBKey,
			  }
			: {};

	return new Table(scope, id, {
		...props,
		cdk: {
			...props.cdk,
			table: props.cdk
				? {
						...props.cdk.table,
						...encryption,
				  }
				: encryption,
		},
	});
};
