import { buildLogger } from '@common/logging/loggerFactory';
import { buildTracer } from '@common/tracing/tracerFactory';
import { envEnum } from '@sst-env';
import { PreAuthenticationTriggerHandler } from 'aws-lambda';
import { authController } from '../loginAttemptsController';

export const handler: PreAuthenticationTriggerHandler = async (
	event,
	context
) => {
	const stage = process.env[envEnum.SST_STAGE];

	if (!stage) {
		throw new Error('No stage');
	}

	const result = await authController.preAuthentication(event, {
		...context,
		logger: buildLogger('preAuthentication'),
		tracer: buildTracer('preAuthentication'),
		stage: stage,
	});

	if (result != 200) {
		throw new Error(`Failed with status ${result.toString()}`);
	} else {
		return event;
	}
};
