import { ApiStack } from './ApiStack';
import { App } from 'sst/constructs';
import { DynamoDbStack } from './DynamoDbStack';
import { RemovalPolicy } from 'aws-cdk-lib';
import { isDev, isProd, isStaging } from './common/isOfStage';

export default function (app: App) {
	if (!isProd(app.stage)) {
		app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
	}
	app.setDefaultFunctionProps({
		runtime: 'nodejs16.x',
		environment: getEnvVars(app.stage),
		nodejs: {
			install: ['re2-wasm'],
			format: 'cjs',
		},
	});

	app.stack(DynamoDbStack).stack(ApiStack);
}

const getEnvVars = (stage: string) => {
	if (isStaging(stage) || isProd(stage)) {
		return {
			POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'false',
			POWERTOOLS_LOGGER_LOG_EVENT: 'false',
			LOG_LEVEL: 'INFO',
			POWERTOOLS_DEV: 'false',
		};
	}
	if (isDev(stage)) {
		return {
			POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'true',
			POWERTOOLS_LOGGER_LOG_EVENT: 'true',
			LOG_LEVEL: 'DEBUG',
			POWERTOOLS_DEV: 'false',
		};
	} else {
		return {
			POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'true',
			POWERTOOLS_LOGGER_LOG_EVENT: 'true',
			LOG_LEVEL: 'DEBUG',
			POWERTOOLS_DEV: 'true',
		};
	}
};
