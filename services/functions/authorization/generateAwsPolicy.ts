import { Logger } from '@aws-lambda-powertools/logger';
import { prettyPrint } from '@common/logging/prettyPrint';
import {
	APIGatewayAuthorizerResult,
	PolicyDocument,
	Statement,
} from 'aws-lambda';

export const generateAwsPolicy = (
	principalId: string,
	effect: string,
	resource: string,
	logger: Logger,
	context?: { [key: string]: string }
) => {
	logger.info('Resource: ' + prettyPrint(resource));
	if (effect && resource && context) {
		const statementOne: Statement = {
			Action: 'execute-api:Invoke',
			Effect: effect,
			Resource: resource,
		};
		const policyDocument: PolicyDocument = {
			Version: '2012-10-17',
			Statement: [statementOne],
		};
		const authResponse: APIGatewayAuthorizerResult = {
			principalId: principalId,
			policyDocument: policyDocument,
			context: context,
		};
		logger.debug(
			'AuthReponse: ' +
				prettyPrint(authResponse.policyDocument?.Statement)
		);
		return authResponse;
	} else {
		throw new Error('Unauthorized');
	}
};
