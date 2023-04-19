import { ApiStack } from './ApiStack';
import { App } from 'sst/constructs';
import { DynamoDbStack } from './DynamoDbStack';
import { RemovalPolicy } from 'aws-cdk-lib';
import { envEnum } from '@sst-env';
import { isProd } from './common/isOfStage';

export default function (app: App) {
	if (!isProd(app.stage)) {
		app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
	}
	app.setDefaultFunctionProps({
		runtime: 'nodejs16.x',
		environment: {
			POWERTOOLS_TRACER_CAPTURE_RESPONSE:
				process.env[envEnum.POWERTOOLS_TRACER_CAPTURE_RESPONSE] ||
				'false',
			POWERTOOLS_LOGGER_LOG_EVENT:
				process.env[envEnum.POWERTOOLS_LOGGER_LOG_EVENT] || 'false',
			LOG_LEVEL: process.env[envEnum.LOG_LEVEL] || 'INFO',
		},
		nodejs: {
			install: ['re2-wasm'],
			format: 'cjs',
		},
	});

	app.stack(DynamoDbStack).stack(ApiStack);
}
