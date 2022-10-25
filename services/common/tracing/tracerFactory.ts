import { Tracer } from '@aws-lambda-powertools/tracer';

export const buildTracer = (serviceName: string) =>
	new Tracer({ serviceName: serviceName });
