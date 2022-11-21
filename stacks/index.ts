import { ApiStack } from './ApiStack';
import { App } from '@serverless-stack/resources';
import { DynamoDbStack } from './DynamoDbStack';
import { RemovalPolicy } from 'aws-cdk-lib';
import { envEnum } from '@sst-env';

export default function (app: App) {
	if (app.stage !== 'prod') {
		app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
	}
	app.setDefaultFunctionProps({
		runtime: 'nodejs16.x',
		srcPath: 'services',
		environment: {
			POWERTOOLS_TRACER_CAPTURE_RESPONSE:
				process.env[envEnum.POWERTOOLS_TRACER_CAPTURE_RESPONSE] ||
				'false',
			POWERTOOLS_LOGGER_LOG_EVENT:
				process.env[envEnum.POWERTOOLS_LOGGER_LOG_EVENT] || 'false',
			LOG_LEVEL: process.env[envEnum.LOG_LEVEL] || 'INFO',
		},
		bundle: {
			nodeModules: ['re2-wasm'],
			format: 'cjs',
		},
	});

	app.stack(DynamoDbStack).stack(ApiStack);
}
