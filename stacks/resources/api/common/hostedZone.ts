import { isProd } from 'stacks/common/isOfStage';
import { DOMAIN } from './domain';

export const getDomainForHostedZone = (stage: string) => {
	if (isProd(stage)) {
		return DOMAIN;
	} else {
		return `${stage}.${DOMAIN}`;
	}
};
