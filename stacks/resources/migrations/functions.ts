import { StackContext, use } from 'sst/constructs';
import { DynamoDbStack } from 'stacks/DynamoDbStack';
import { KeysStack } from 'stacks/KeysStack';
import { createDefaultFunction } from 'stacks/common/defaultFunction';

export const triggerMigrations = (context: StackContext) => {
	const { migrationsTable, bankTable } = use(DynamoDbStack);
	const { withDynamoDBKeyPolicy } = use(KeysStack);

	return createDefaultFunction(context, 'migrations', {
		handler:
			'services/functions/migrations/application/handler/trigger.handler',
		environment: {
			MIGRATIONS_TABLE: migrationsTable.tableName,
			BANKS_TABLE: bankTable.tableName,
		},
		permissions: withDynamoDBKeyPolicy(['secretsmanager']),
		bind: [migrationsTable, bankTable],
	});
};
