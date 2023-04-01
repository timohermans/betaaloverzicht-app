import type { Budget, Transaction, Category } from '$lib/types';
import PocketBase from 'pocketbase';
import {
	Collections,
	type TransactionsResponse,
	type CategoriesResponse,
	type TransactionsRecord
} from './book_types';


function getMonthQueryParams(month: Date): { start: Date; end: Date } {
	const start = new Date(month.getFullYear(), month.getMonth(), 1);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	end.setDate(end.getDate() - 1);
	return { start, end };
}

export async function getTransactionsOf(
	month: Date,
	pbInstance: PocketBase
): Promise<Transaction[]> {
	const { start, end } = getMonthQueryParams(month);
	const book = pbInstance;

	const results = await book
		.collection(Collections.Transactions)
		.getFullList<TransactionsResponse<CategoriesResponse>>({
			filter: `date_transaction >= "${start.toISOString()}" && date_transaction <= "${end.toISOString()}"`,
			sort: 'date_transaction,name_other_party',
			expand: 'category'
		});

	return results.map((t) => ({
		id: t.id,
		currency: t.currency,
		date_transaction: t.date_transaction,
		iban: t.iban,
		code: t.code,
		description: t.description,
		follow_number: t.follow_number?.toString() ?? '',
		iban_other_party: t.iban_other_party,
		name_other_party: t.name_other_party,
		amount_after_transaction: t.amount_after_transaction,
		amount: t.amount,
		category_id: t.category
	}));

	// return (await client<Transaction>('/transactions', {
	// 	selectQueryParam: [
	// 		{ property: '*' },
	// 		{
	// 			property: 'category',
	// 			relationshipProperties: ['id', 'name', 'is_ignored_in_totals'],
	// 			relationshipTableName: 'categories'
	// 		}
	// 	],
	// 	filterQueryParams: [
	// 		{ property: 'date_transaction', operator: 'gte', value: start },
	// 		{ property: 'date_transaction', operator: 'lte', value: end }
	// 	],
	// 	orderQueryParam: [{ property: 'date_transaction' }, { property: 'name_other_party' }]
	// })) as Transaction[];
	return [];
}

export async function getAllTransactions(): Promise<Transaction[]> {
	// return (await client<Transaction>('/transactions', {
	// 	selectQueryParam: [
	// 		{ property: '*' },
	// 		{
	// 			property: 'category',
	// 			relationshipProperties: ['id', 'name'],
	// 			relationshipTableName: 'categories'
	// 		}
	// 	]
	// })) as Transaction[];
	return [];
}

export async function upsertCategory(name: string): Promise<Category> {
	// return (await client<Category>('/categories', {
	// 	body: { name },
	// 	method: 'POST',
	// 	onConflict: {
	// 		property: 'name',
	// 		resolution: 'merge-duplicates'
	// 	},
	// 	requestSingleResult: true,
	// 	requestReturnObject: true
	// })) as Category;
}

export async function assignCategoryTo(transactionId: number, categoryId: number): Promise<void> {
	// await client<Transaction>('/transactions', {
	// 	filterQueryParams: [{ property: 'id', value: transactionId.toString(), operator: 'eq' }],
	// 	method: 'PATCH',
	// 	body: { category_id: categoryId }
	// });
}

export async function getCategories(): Promise<Category[]> {
	// return (await client<Category>('/categories', {
	// 	orderQueryParam: [{ property: 'name' }]
	// })) as Category[];
	return [];
}

export async function getBudgetsOf(month: Date): Promise<Budget[]> {
	// return (await client<Budget>('/budgets', {
	// 	filterQueryParams: [
	// 		{ property: 'year', operator: 'eq', value: month.getFullYear().toString() },
	// 		{ property: 'month', operator: 'eq', value: (month.getMonth() + 1).toString() }
	// 	]
	// })) as Budget[];
	return [];
}

export async function upsertBudget(
	categoryId: number,
	amount: number,
	monthDate: Date
): Promise<Budget> {
	// const year = monthDate.getFullYear();
	// const month = monthDate.getMonth() + 1;
	// return (await client<Budget>('/budgets', {
	// 	method: 'POST',
	// 	body: { year, month, category_id: categoryId, amount },
	// 	onConflict: { property: ['category_id', 'year', 'month'], resolution: 'merge-duplicates' },
	// 	requestSingleResult: true,
	// 	requestReturnObject: true
	// })) as Budget;
}

export async function saveTransactions(transactions: Transaction[], pb: PocketBase): Promise<void> {
	const creates = transactions.map((t) =>
		pb.collection(Collections.Transactions).create<TransactionsRecord>(
			{
				amount: t.amount,
				currency: t.currency,
				date_transaction: t.date_transaction,
				iban: t.iban,
				code: t.code,
				description: t.description,
				follow_number: +t.follow_number,
				iban_other_party: t.iban_other_party,
				name_other_party: t.name_other_party,
				amount_after_transaction: t.amount_after_transaction,
				user: pb.authStore.model?.id
			} as TransactionsRecord,
			{
				$autoCancel: false
			}
		)
	);

	await Promise.all(creates);

	// await client<Transaction>('/transactions', {
	// 	body: transactions,
	// 	method: 'POST',
	// 	onConflict: { property: 'code', resolution: 'ignore-duplicates' }
	// });
}

export async function ignoreCategoryInTotalsBy(
	categoryId: number,
	isIgnoredInTotals: boolean
): Promise<void> {
	// await client<Category>('/categories', {
	// 	filterQueryParams: [{ property: 'id', operator: 'eq', value: categoryId.toString() }],
	// 	body: { is_ignored_in_totals: isIgnoredInTotals },
	// 	method: 'PATCH'
	// });
}
