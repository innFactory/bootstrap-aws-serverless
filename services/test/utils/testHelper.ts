import * as api from './client/index';
import { config } from '@sst-config';
import { AxiosError } from 'axios';
import { fail } from 'assert';
import { expect } from 'vitest';
import { ServiceException } from '@aws-smithy/server-common';

const createUrl = () =>
	config.API_URL.endsWith('/')
		? config.API_URL.slice(0, config.API_URL.length - 1)
		: config.API_URL;
const createClient = () => api.DefaultApiFactory(undefined, createUrl());
const wrapAxios = async (
	axiosRequestProcessor: () => Promise<unknown>,
	axiosErrorProcessor?: (error: AxiosError) => void
) => {
	try {
		await axiosRequestProcessor();
	} catch (e) {
		const axiosError = e as AxiosError;
		if (axiosErrorProcessor) {
			axiosErrorProcessor(axiosError);
		} else {
			if (axiosError.response?.status === undefined) {
				console.log(e);
			}
			fail(
				`unexpected error: ${
					axiosError.response?.status
				} ${JSON.stringify(axiosError.response?.data)}`
			);
		}
	}
};

const expectErrorMessages = (error: AxiosError, expected: string) => {
	const serviceException = error.response?.data as ServiceException;
	expect(serviceException.message).toBe(expected);
};

export const testHelper = {
	createUrl,
	createClient,
	wrapAxios,
	expectErrorMessages,
};
