import { StackContext, ApiGatewayV1Api, Config } from 'sst/constructs';
import {
	cognitoLambdaAuthorizer,
	defaultCognitoAuthorizerRouteOnTestStage,
	getCognitoAuthorizer,
} from '@resources/auth/cognito/authorizer';
import {
	createDefaultFunction,
	defaultFunctionName,
} from './common/defaultFunction';
import { apiKeyAuthorizer } from '@resources/auth/apiKey/authorizer';
import { Authorizers } from '@resources/api/models/authorizers';
import { bankRoutes } from '@resources/banks/routes';
import { userRoutes } from '@resources/users/routes';
import { migrationsRoutes } from '@resources/migrations/routes';
import { isDeployedStage, isDev } from './common/isOfStage';
import { createDomainName } from '@resources/api/common/domain';
import { getDomainForHostedZone } from '@resources/api/common/hostedZone';

export function ApiStack(context: StackContext) {
	const authorizers: Authorizers = {
		cognitoLambdaAuthorizer: cognitoLambdaAuthorizer(context),
		apiKeyAuthorizer: apiKeyAuthorizer(context),
	};

	const api = new ApiGatewayV1Api(context.stack, 'api', {
		authorizers: authorizers,
		defaults: {
			authorizer: getCognitoAuthorizer(context.stack.stage),
		},
		routes: {
			...bankRoutes(context),
			...userRoutes(context),
			...migrationsRoutes(context),

			'ANY /{proxy+}': {
				function: createDefaultFunction(context, 'any-route', {
					functionName: defaultFunctionName(context, 'any-route'),
					handler: 'services/functions/default.handler',
				}),
				authorizer: 'none',
			},
			...defaultCognitoAuthorizerRouteOnTestStage(context.stack.stage),
		},
		cors: true,
		accessLog: true,
		cdk: {
			restApi: {
				/**
				 * The cloud watch role is overwritten by the latest deployment.
				 * Therefore create only one per aws account (e.g. for the deployed/productive stages like dev/staging/prod but not for local/test stages in the same aws account).
				 * If there is one aws account per stage: set to true for other deployed stages as well.
				 */
				cloudWatchRole: isDev(context.app.stage),
			},
		},
		customDomain: isDeployedStage(context.app.stage)
			? {
					domainName: createDomainName(context.app.stage),
					hostedZone: getDomainForHostedZone(context.app.stage),
					securityPolicy: 'TLS 1.2',
			  }
			: undefined,
	});

	new Config.Parameter(context.stack, 'API_URL', {
		value: api.url,
	});

	return { api };
}
