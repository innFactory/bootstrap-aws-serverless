import { DDBKey } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { AllDataResponse } from '@common/dynamodb/domain/model/allDataResponse';

export interface Bank {
	id: string;
	name: string;
}
export type BankListOutput = AllDataResponse<Bank>;

export type BankDDB = Omit<Bank, ''>;

export type BankDDBItem = Omit<BankDDB, 'id'> & {
	id: DDBKey<string>;
};
