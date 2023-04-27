import { DDBKey } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { Bank, BankDDBItem } from '@functions/banks/domain/model/bank';

export const mapBankDomainToDDB = (bank: Bank): BankDDBItem => ({
	id: new DDBKey(bank.id),
	name: bank.name,
});
