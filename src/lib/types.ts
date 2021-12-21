export type ById<T> = { [id: number | string]: T };

export type Budget = {
	id: number;
	year: number;
	month: number;
	amount: number;
	user_id: number;
	category_id: number;
};

export type Transaction = {
	id: number;
	code: string;
	iban: string;
	currency: string;
	follow_number: string;
	date_transaction: string;
	amount: string;
	amount_after_transaction: string;
	name_other_party: string;
	iban_other_party: string;
	description: string;
	category?: Category;
	category_id?: number;
};

export type Category = {
	id: number;
	name: string;
};

export type TransactionSummary = { name_other_party: string; amount: number };

export type CategorySummary = {
	category: Category;
	amount: number;
	transactions: ById<TransactionSummary>;
};
