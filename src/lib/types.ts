export type ById<T> = { [id: number | string]: T };

export type Transaction = {
	id: string;
	iban: string;
	currency: string;
	follow_number: string;
	date_transaction: string;
	amount: string;
	amount_after_transaction: string;
	name_other_party?: string;
	iban_other_party?: string;
	authorization_code?: string;
	description: string;
	category?: Category;
	category_id?: string;
};

export type Category = {
	id: string;
	name: string;
};

export type TransactionSummary = { name_other_party: string; amount: number };

export type CategorySummary = {
	category: Category;
	amount: number;
	transactions: ById<TransactionSummary>;
};
