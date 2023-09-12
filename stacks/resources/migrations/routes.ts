import { StackContext } from 'sst/constructs';
import { triggerMigrations } from '@resources/migrations/functions';
import { Routes } from '@resources/api/models/routes';

export const migrationsRoutes = (context: StackContext): Routes => ({
	'POST /v1/migrations': {
		function: triggerMigrations(context),
		authorizer: 'apiKeyAuthorizer',
	},
});
