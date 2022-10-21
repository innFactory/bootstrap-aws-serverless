import { ApiStack } from './ApiStack';
import { App } from '@serverless-stack/resources';
import { DynamoDbStack } from './DynamoDbStack';

export default function (app: App) {
	app.setDefaultFunctionProps({
		runtime: 'nodejs16.x',
		srcPath: 'services',
		bundle: {
			nodeModules: ['re2-wasm'],
			format: 'cjs',
		},
	});
	app.stack(ApiStack).stack(DynamoDbStack);
}
