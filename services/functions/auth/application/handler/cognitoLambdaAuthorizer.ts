import {
	APIGatewayAuthorizerResult,
	APIGatewayRequestAuthorizerHandler,
} from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import jwt_decode from 'jwt-decode';
import { prettyPrint } from '@common/logging/prettyPrint';
import { ApiGatewayHandler } from '@common/gateway/handler/apiGatewayHandler';

export const handler: APIGatewayRequestAuthorizerHandler = async (
	event,
	context
) => {
	const invocationContext =
		ApiGatewayHandler.createInvocationContextOrThrow(context);
	const { logger } = invocationContext;
	logger.addContext(context);

	const authHeader =
		event.headers?.authorization ?? event.headers?.Authorization ?? '';
	logger.debug(authHeader);
	if (!authHeader.startsWith('Bearer ')) {
		throw new Error('Unauthorized');
	}
	const token = authHeader.substring(7, authHeader.length);

	const decoded: { [key: string]: unknown } = jwt_decode(token);
	const iss = decoded['iss'] as string;
	const userPoolId = iss.replace(
		'https://cognito-idp.eu-central-1.amazonaws.com/',
		''
	);

	const stage = process.env.SST_STAGE;
	if (stage === undefined) {
		logger.error('No stage defined');
		throw new Error('Unauthorized');
	}

	const cognitoInstanceId = Object.keys(process.env)
		.filter((k) => k.includes('_USER_POOL_ID'))
		.find((k) => {
			const value = process.env[k];
			return value && value.includes(userPoolId);
		})
		?.replace('_USER_POOL_ID', '');

	if (cognitoInstanceId === undefined) {
		logger.warn('No cognitoInstanceId');
		logger.debug(
			`UserPoolId: ${userPoolId}, cognitoInstanceId: ${cognitoInstanceId}`
		);
		throw new Error('Unauthorized');
	}

	const userPoolClientId =
		process.env[`${cognitoInstanceId}_USER_POOL_CLIENT_ID`];

	if (userPoolClientId === undefined) {
		logger.warn('No userPoolClientId - invalid token');
		logger.debug(
			`UserPoolId: ${userPoolId}, cognitoInstanceId: ${cognitoInstanceId}`
		);
		throw new Error('Unauthorized');
	}

	try {
		const verifier = CognitoJwtVerifier.create({
			userPoolId: userPoolId,
			tokenUse: 'id',
			clientId: userPoolClientId,
		});

		const payload = await verifier.verify(token, {
			clientId: userPoolClientId,
		});

		const authResponse: APIGatewayAuthorizerResult = {
			principalId: payload.sub,
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
	} catch (e) {
		logger.warn(`Invalid token ${prettyPrint(e)}`);
		throw new Error('Unauthorized');
	}
};
