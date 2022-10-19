import { MyStack } from './MyStack';
import { App } from '@serverless-stack/resources';

export default function (app: App) {
	app.setDefaultFunctionProps({
		runtime: 'nodejs16.x',
		srcPath: 'services',
		bundle: {
			nodeModules: ['re2-wasm'],
			format: 'cjs',
		},
	});
	app.stack(MyStack);
}
