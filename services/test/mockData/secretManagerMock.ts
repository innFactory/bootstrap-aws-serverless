import { ApiKeySecret } from '@common/secretmanager/domain/models/apiKeySecret';

const migrationsApiKey: ApiKeySecret = {
	apiKey: 'test-api-key',
	version: 1,
};

export const secretManagerMock: { [key: string]: unknown } = {
	'migrations-api-key': migrationsApiKey,
};
