import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Context } from 'aws-lambda';

export interface InvocationContext extends Context {
	logger: Logger;
	tracer: Tracer;
}
