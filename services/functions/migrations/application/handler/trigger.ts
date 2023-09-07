import { APIGatewayProxyHandler } from 'aws-lambda';
import {
	apiGatewayHandler,
	tracer,
} from '@common/gateway/handler/apiGatewayHandler';
import { traceOperation } from '@common/tracing/traceLifecycle';
import { getTriggerMigrationsHandler } from '@api';
import { migrationController } from '../migrationController';

export const handler: APIGatewayProxyHandler = apiGatewayHandler.handle(
	getTriggerMigrationsHandler(
		traceOperation(migrationController.trigger, tracer)
	)
);
