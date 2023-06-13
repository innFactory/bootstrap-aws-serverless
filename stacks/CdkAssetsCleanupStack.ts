import { StackContext } from 'sst/constructs';
import { ToolkitCleaner } from 'cloudstructs/lib/toolkit-cleaner';

// deploy it once per AWS account
export const CdkAssetsCleanupStack = (context: StackContext) => {
	const cleaner = new ToolkitCleaner(context.stack, 'CdkAssetCleaner', {
		scheduleEnabled: false, // enable schedule or execute manually in cloud console via the step function menu
	});

	return {
		cleaner,
	};
};
