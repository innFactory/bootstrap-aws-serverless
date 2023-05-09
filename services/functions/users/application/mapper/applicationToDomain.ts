import {
	CreateUserRequestServerInput,
	DeleteUserRequestServerInput,
	GetUserByMailRequestServerInput,
	GetUserRequestServerInput,
	UpdatePasswordRequestServerInput,
} from '@api';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { taskEither } from 'fp-ts';

export const mapCreateUserInput = (
	input: CreateUserRequestServerInput
): TaskResult<{ email: string; password: string }> => {
	if (input.email && input.password) {
		return taskEither.right({
			email: input.email,
			password: input.password,
		});
	} else {
		return taskEither.left(errorResults.badRequest(''));
	}
};

export const mapGetUserInput = (
	input: GetUserRequestServerInput
): TaskResult<{ id: string }> => {
	if (input.id) {
		return taskEither.right({ id: input.id });
	} else {
		return taskEither.left(errorResults.badRequest(''));
	}
};

export const mapGetUserByMailInput = (
	input: GetUserByMailRequestServerInput
): TaskResult<{ email: string }> => {
	if (input.email) {
		return taskEither.right({ email: input.email });
	} else {
		return taskEither.left(errorResults.badRequest(''));
	}
};

export const mapUpdatePasswordInput = (
	input: UpdatePasswordRequestServerInput
): TaskResult<{ id: string; password: string }> => {
	if (input.id && input.password) {
		return taskEither.right({ id: input.id, password: input.password });
	} else {
		return taskEither.left(errorResults.badRequest(''));
	}
};

export const mapDeleteUserInput = (
	input: DeleteUserRequestServerInput
): TaskResult<{ id: string }> => {
	if (input.id) {
		return taskEither.right({ id: input.id });
	} else {
		return taskEither.left(errorResults.badRequest(''));
	}
};
