import { Config, ConfigTypes } from 'sst/node/config';

interface CustomConfig extends ConfigTypes {
	API_URL: string;
	APP: string;
	STAGE: string;
}

export const config = Config as CustomConfig;
