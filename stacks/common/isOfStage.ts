export const isDeployedStage = (stage: string | undefined): boolean => {
	return isProd(stage) || isStaging(stage) || isDev(stage);
};

export const isDev = (stage: string | undefined): boolean => {
	return stage === 'dev';
};

export const isStaging = (stage: string | undefined): boolean => {
	return stage === 'staging';
};

export const isProd = (stage: string | undefined): boolean => {
	return stage === 'prod';
};

export const isTestStage = (stage: string | undefined): boolean => {
	return (
		stage === 'test' || (stage !== undefined && stage.startsWith('ci-test'))
	);
};
