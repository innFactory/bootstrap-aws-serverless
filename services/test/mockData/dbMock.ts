import { DDBItem } from '@common/dynamodb/domain/interfaces/dynamoDbRepository';
import { TABLE_KEYS } from '@common/dynamodb/tableKeys';
import { banksMock } from './bankMock';

export const dbMock: { [key: string]: DDBItem[] } = {};
dbMock[TABLE_KEYS.BANKS_TABLE] = banksMock;
