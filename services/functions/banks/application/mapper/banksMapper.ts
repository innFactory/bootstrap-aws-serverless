import {
	BanksRequest,
	CreateBankRequestServerInput,
	DeleteBankRequestServerInput,
	GetBankInput,
	UpdateBankRequestServerInput,
} from '@api';
import { errorResults } from '@common/results/errorResults';
import { TaskResult } from '@common/results/taskResult';
import { Bank } from '@functions/banks/domain/model/bank';
import { ListBanksInput } from '@functions/banks/domain/model/listBanksInput';
import { DynamoDB } from 'aws-sdk';
import { taskEither } from 'fp-ts';
import { v4 } from 'uuid';

export const mapGetBankInput = (input: GetBankInput): TaskResult<string> => {
	if (input.id) {
		return taskEither.right(input.id);
	} else {
		return taskEither.left(errorResults.badRequest('No ID provided'));
	}
};

export const mapListBankInput = (
	input: BanksRequest
): TaskResult<ListBanksInput> => {
	return taskEither.right({
		queryAll: input.queryAll,
		limit: input.limit,
		lastEvaluatedKey: input.lastEvaluatedKey
			? (JSON.parse(
					Buffer.from(input.lastEvaluatedKey, 'base64').toString(
						'utf-8'
					)
			  ) as DynamoDB.Key)
			: undefined,
	});
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
	if (input.name && input.id) {
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
