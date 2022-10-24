import {
	CreateBankRequestServerInput,
	DeleteBankRequestServerInput,
	GetBankInput,
	UpdateBankRequestServerInput,
} from '@api';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { Bank } from '@functions/banks/domain/model/bank';
import { taskEither } from 'fp-ts';
import { v4, validate } from 'uuid';

export const mapGetBankInput = (input: GetBankInput): TaskResult<string> => {
	if (input.id) {
		return taskEither.right(input.id);
	} else {
		return taskEither.left(errorResults.badRequest('No ID provided'));
	}
};

export const mapCreateBankInput = (
	input: CreateBankRequestServerInput
): TaskResult<Bank> => {
	if (input.name) {
		return taskEither.right({
			id: v4(),
			name: input.name,
		});
	} else {
		return taskEither.left(errorResults.badRequest('Name is required'));
	}
};

export const mapUpdateBankInput = (
	input: UpdateBankRequestServerInput
): TaskResult<Bank> => {
	if (input.name && input.id && validate(input.id)) {
		return taskEither.right({
			id: input.id,
			name: input.name,
		});
	} else {
		return taskEither.left(errorResults.badRequest('Name is required'));
	}
};

export const mapDeleteBankInput = (
	input: DeleteBankRequestServerInput
): TaskResult<string> => {
	if (input.id) {
		return taskEither.right(input.id);
	} else {
		return taskEither.left(errorResults.badRequest('No ID provided'));
	}
};
