import { Logger } from '@aws-lambda-powertools/logger';
import { buildLogger } from '@common/logging/loggerFactory';
import { prettyPrint } from '@common/logging/prettyPrint';
import {
	APIGatewayRequestAuthorizerEvent,
	APIGatewayRequestAuthorizerHandler,
} from 'aws-lambda';
import jwt from 'jsonwebtoken';

import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { generateAwsPolicy } from '../../generateAwsPolicy';
import { errorResults } from '@common/results/errorResults';

export const handler: APIGatewayRequestAuthorizerHandler = async (
	event,
	context
) => {
	const logger = buildLogger('MockedAuthorizer');
	logger.addContext(context);
	const token = (event.headers?.Authorization ?? '').split(' ')[1];

	return pipe(
		policy(token, event, logger),
		taskEither.match(
			(error) => {
				logger.debug(prettyPrint(error));
				throw 'Unauthorized';
			},
			(policy) => {
				return policy;
			}
		)
	)();
};

const policy = (
	token: string,
	event: APIGatewayRequestAuthorizerEvent,
	logger: Logger
) =>
	taskEither.tryCatch(
		async () => {
			logger.debug(prettyPrint(token));
			const tokenContext = jwt.decode(token, {
				complete: true,
			});
			if (!tokenContext) {
				throw new Error();
			}

			const tokenPayload = tokenContext.payload as {
				sub: string;
				name: string;
			};

			logger.debug(prettyPrint(tokenPayload));

			return generateAwsPolicy('SUB', 'ALLOW', event.methodArn, logger, {
				user: tokenPayload.name,
				id: tokenPayload.sub,
			});
		},
		() => errorResults.unauthorized('Invalid token')
	);
