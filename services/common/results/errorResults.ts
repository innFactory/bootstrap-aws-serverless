import { ErrorResult } from './errorResult';

const badRequest = (msg: string): ErrorResult =>
	createErrorResult(StatusCodes.BAD_REQUEST, msg);

const unauthorized = (msg: string): ErrorResult =>
	createErrorResult(StatusCodes.UNAUTHORIZED, msg);

const notFound = (msg: string): ErrorResult =>
	createErrorResult(StatusCodes.NOT_FOUND, msg);

const preconditionRequired = (msg: string): ErrorResult =>
	createErrorResult(StatusCodes.PRECONDITION_REQUIRED, msg);

const internalServerError = (msg = 'Internal Server Error'): ErrorResult =>
	createErrorResult(StatusCodes.INTERNAL_SERVER_ERROR, msg);

const badGateway = (msg = 'Bad Gateway'): ErrorResult =>
	createErrorResult(StatusCodes.BAD_GATEWAY, msg);

const forbidden = (msg: string): ErrorResult =>
	createErrorResult(StatusCodes.FORBIDDEN, msg);

const locked = (msg: string): ErrorResult =>
	createErrorResult(StatusCodes.LOCKED, msg);

const conflict = (msg: string): ErrorResult =>
	createErrorResult(StatusCodes.CONFLICT, msg);

const createErrorResult = (
	statusCode: StatusCodes,
	message: string
): ErrorResult => ({
	statusCode: statusCode,
	body: {
		message: message,
	},
});

export enum StatusCodes {
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	CONFLICT = 409,
	LOCKED = 423,
	PRECONDITION_REQUIRED = 428,
	INTERNAL_SERVER_ERROR = 500,
	BAD_GATEWAY = 502,
}

export const errorResults = {
	badRequest,
	unauthorized,
	forbidden,
	notFound,
	preconditionRequired,
	internalServerError,
	badGateway,
	locked,
	conflict,
};
