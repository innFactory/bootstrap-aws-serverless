import {
	APIGatewayProxyEvent,
	APIGatewayProxyEventHeaders,
	Context,
} from 'aws-lambda';
import jwt from 'jsonwebtoken';
import {
	InvocationContextWithUser,
	UserContext,
} from '../model/invocationContextWithUser';
import { ApiGatewayHandler } from './apiGatewayHandler';
import { errorResults } from '@common/results/errorResults';
import { Either } from 'fp-ts/lib/Either';
import { either } from 'fp-ts';
import { HttpResponse } from '@aws-sdk/types';

export class UserApiGatewayHandler extends ApiGatewayHandler<InvocationContextWithUser> {
	protected createContext(
		event: APIGatewayProxyEvent,
		context: Context
	): Either<HttpResponse, InvocationContextWithUser> {
		const user = this.extractUser(event.headers);
		const invocationContext =
			ApiGatewayHandler.createInvocationContext(context);

		if (invocationContext === undefined) {
			const internalServerError = errorResults.internalServerError('');
			return either.left({
				statusCode: internalServerError.statusCode,
				body: JSON.stringify(internalServerError.body),
				headers: {
					'x-amzn-errortype': 'Unauthorized',
					'content-type': 'application/json',
				},
			});
		}

		if (user !== undefined) {
			return either.right({
				...invocationContext,
				user: user,
			});
		} else {
			const unauthorized = errorResults.unauthorized('');
			return either.left({
				statusCode: unauthorized.statusCode,
				body: JSON.stringify(unauthorized.body),
				headers: {
					'x-amzn-errortype': 'Unauthorized',
					'content-type': 'application/json',
				},
			});
		}
	}

	private extractUser = (
		headers: APIGatewayProxyEventHeaders
	): UserContext | undefined => {
		const bearerToken =
			headers['Authorization'] ?? headers['authorization'];
		if (bearerToken !== undefined && bearerToken.startsWith('Bearer ')) {
			const token = bearerToken.split('Bearer ');
			if (token.length === 2) {
				const tokenContext = jwt.decode(token[1]);
				if (
					typeof tokenContext === 'string' ||
					tokenContext === null ||
					tokenContext.sub === undefined
				) {
					return undefined;
				} else {
					return {
						id: tokenContext.sub,
					};
				}
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	};
}

export const userApiGatewayHandler = new UserApiGatewayHandler();
