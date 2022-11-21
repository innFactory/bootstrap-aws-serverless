import { buildLogger } from '@common/logging/loggerFactory';
import jwt from 'jsonwebtoken';
import {
	APIGatewayRequestAuthorizerEvent,
	APIGatewayRequestAuthorizerHandler,
} from 'aws-lambda';
import { pipe } from 'fp-ts/lib/function';
import { either, taskEither } from 'fp-ts';
import { errorResults } from '@common/results/errorResults';
import { Either } from 'fp-ts/lib/Either';
import { ErrorResult } from '@common/results/errorResult';
import { prettyPrint } from '@common/logging/prettyPrint';
import { Logger } from '@aws-lambda-powertools/logger';
import { Keys } from '../../model/keys';
import { generateAwsPolicy } from '@functions/authorization/generateAwsPolicy';

export const handler: APIGatewayRequestAuthorizerHandler = async (
	event,
	context
) => {
	const logger = buildLogger('Authorizer');
	logger.addContext(context);
	const authHeader = event.headers?.Authorization ?? '';
	if (!authHeader.startsWith('Bearer ')) {
		throw 'Unauthorized';
	}
	const token = authHeader.substring(7, authHeader.length);

	return pipe(
		getJwks,
		taskEither.chain((keys) => policy(keys, token, event, logger)),
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
	keys: Keys,
	token: string,
	event: APIGatewayRequestAuthorizerEvent,
	logger: Logger
) =>
	taskEither.tryCatch(
		async () => {
			const tokenContext = jwt.decode(token, {
				complete: true,
			});
			if (!tokenContext) {
				throw new Error();
			}

			//expected JWT claims
			const tokenPayload = tokenContext.payload as {
				sub: string;
				name: string;
			};

			/*
			//verify the token here
			const key = keys.keys.find(
				(k) => k.kid === tokenContext?.header.kid
			) as jwkToPem.JWK | undefined;
			if (!key) {
				throw new Error();
			}
			const pem = jwkToPem(key);
			const decoded = jwt.verify(token, pem);
			*/

			const decoded = jwt.decode(token);

			logger.info('Verify Result: ' + JSON.stringify(decoded));
			return generateAwsPolicy(
				tokenPayload.sub,
				'ALLOW',
				event.methodArn,
				logger,
				{
					user: tokenPayload.name,
					id: tokenPayload.sub,
				}
			);
		},
		() => errorResults.unauthorized('Invalid token')
	);

const getJwks = async (): Promise<Either<ErrorResult, Keys>> => {
	//fetch and return token here
	return either.right({} as Keys);
};
