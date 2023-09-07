import { BaseController } from '@common/application/baseController';
import { ApiGatewayHandler } from '@common/gateway/handler/apiGatewayHandler';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import { lazyInject } from '@common/injection/decorator';
import { INJECTABLES } from '@common/injection/injectables';
import { StatusCodes, errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { SecretManagerRepository } from '@common/secretmanager/domain/interfaces/secretManagerRepository';
import { ApiKeySecret } from '@common/secretmanager/domain/models/apiKeySecret';
import {
	APIGatewayAuthorizerResult,
	APIGatewayRequestAuthorizerHandler,
} from 'aws-lambda';
import { taskEither } from 'fp-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

export const handler: APIGatewayRequestAuthorizerHandler = async (
	event,
	context
) => {
	const ctx = ApiGatewayHandler.createInvocationContextOrThrow(context);

	const apiToken =
		event.headers?.authorization ?? event.headers?.Authorization ?? '';

	const result = await apiKeyAuthorizer.auth(apiToken, ctx)();
	if (isLeft(result)) {
		if (result.left.statusCode === StatusCodes.UNAUTHORIZED) {
			throw new Error('Unauthorized');
		} else {
			throw new Error('Internal Server Error');
		}
	} else {
		const authResponse: APIGatewayAuthorizerResult = {
			principalId: 'api-key-auth',
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'ALLOW',
						Resource: event.methodArn,
					},
				],
			},
			context: {},
		};

		return authResponse;
	}
};

class ApiKeyAuthorizer extends BaseController {
	@lazyInject(INJECTABLES.SecretManagerRepository)
	private secretManagerRepository!: SecretManagerRepository;

	auth(apiToken: string, context: InvocationContext): TaskResult<void> {
		return pipe(
			this.secretManagerRepository.get<ApiKeySecret>(
				'migrations-api-key',
				context
			),
			taskEither.chain((secret) => {
				if (secret.apiKey === apiToken) {
					return taskEither.right(void 0);
				} else {
					return taskEither.left(
						errorResults.unauthorized('Invalid api key')
					);
				}
			})
		);
	}
}
const apiKeyAuthorizer = new ApiKeyAuthorizer();
