import type { SSTConfig } from 'sst';
import * as sstStacks from './stacks/index';

const configuration: SSTConfig = {
	config() {
		return {
			name: 'bootstrap-aws-serverless',
			region: 'eu-central-1',
		};
	},
	stacks(app) {
		sstStacks.default(app);
	},
};

export default configuration;
