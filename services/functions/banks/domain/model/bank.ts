export interface Bank {
	id: string;
	name: string;
}
export interface BankListOutput {
	items: Bank[];
	lastEvaluatedKey?: string;
}
