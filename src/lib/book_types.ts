/**
 * This file was @generated using pocketbase-typegen
 */

export enum Collections {
	Budgets = 'budgets',
	Categories = 'categories',
	Transactions = 'transactions',
	Users = 'users'
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString;
	created: IsoDateString;
	updated: IsoDateString;
	collectionId: string;
	collectionName: Collections;
	expand?: T;
};

export type AuthSystemFields<T = never> = {
	email: string;
	emailVisibility: boolean;
	username: string;
	verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type BudgetsRecord = {
	year: number;
	month: number;
	amount: number;
	user: RecordIdString;
	category: RecordIdString;
};

export type CategoriesRecord = {
	name: string;
	user: RecordIdString;
};

export type TransactionsRecord = {
	code: string;
	iban: string;
	currency: string;
	follow_number?: number;
	date_transaction: IsoDateString;
	amount: string;
	amount_after_transaction: string;
	iban_other_party?: string;
	name_other_party?: string;
	description: string;
	user: RecordIdString;
	category?: RecordIdString;
};

export type UsersRecord = {
	name?: string;
	avatar?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type BudgetsResponse<Texpand = unknown> = BudgetsRecord & BaseSystemFields<Texpand>;
export type CategoriesResponse<Texpand = unknown> = CategoriesRecord & BaseSystemFields<Texpand>;
export type TransactionsResponse<Texpand = unknown> = TransactionsRecord &
	BaseSystemFields<Texpand>;
export type UsersResponse = UsersRecord & AuthSystemFields;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	budgets: BudgetsRecord;
	categories: CategoriesRecord;
	transactions: TransactionsRecord;
	users: UsersRecord;
};

export type CollectionResponses = {
	budgets: BudgetsResponse;
	categories: CategoriesResponse;
	transactions: TransactionsResponse;
	users: UsersResponse;
};
