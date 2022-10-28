import { Config, ConfigType } from '@serverless-stack/node/config';

interface CustomConfig extends ConfigType {
	API_URL: string;
	APP: string;
	STAGE: string;
}

export const config = Config as CustomConfig;
