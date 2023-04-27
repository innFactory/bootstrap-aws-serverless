import { Bank, BankDDB } from '@functions/banks/domain/model/bank';

export const mapBankDDBToDomain = (bank: BankDDB): Bank => bank;
