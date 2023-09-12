import { isDeployedStage, isProd } from 'stacks/common/isOfStage';

export const DOMAIN = 'innfactory.de';
export const DOMAIN_PREFIX = 'serverless-bootstrap';

export const createDomainName = (stage: string): string | undefined => {
	if (isDeployedStage(stage)) {
		if (isProd(stage)) {
			return `api.${DOMAIN_PREFIX}.${DOMAIN}`;
		} else {
			return `api.${DOMAIN_PREFIX}.${stage}.${DOMAIN}`;
		}
	} else {
		return undefined;
	}
};
