import type { Budget, Transaction, Category } from '$lib/types';
import PocketBase from 'pocketbase';
import {
	Collections,
	type TransactionsResponse,
	type CategoriesResponse,
	type TransactionsRecord,
	type BudgetsResponse
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
		.getFullList<TransactionsResponse<{ category: CategoriesResponse }>>({
			filter: `date_transaction >= "${start.toISOString()}" && date_transaction <= "${end.toISOString()}"`,
			sort: 'date_transaction,name_other_party',
			expand: 'category'
		});

	const mapped = results.map((t) => {
		let category: Category | undefined = undefined;

		if (t.expand?.category) {
			category = {
				id: t.expand.category.id,
				name: t.expand.category.name,
				is_ignored_in_totals: t.expand.category.is_ignored_in_totals
			};
		}
		return {
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
			category_id: t.category,
			category
		};
	});

	return mapped;
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

export async function getCategories(pb: PocketBase): Promise<Category[]> {
	const categories = await pb.collection(Collections.Categories).getFullList<CategoriesResponse>({
		sort: 'name'
	});
	return categories.map((c) => ({
		id: c.id,
		name: c.name,
		is_ignored_in_totals: c.is_ignored_in_totals
	}));
}

export async function getBudgetsOf(month: Date, pb: PocketBase): Promise<Budget[]> {
	const budgets = await pb.collection(Collections.Budgets).getFullList<BudgetsResponse>({
		filter: `year=${month.getFullYear()} && month=${month.getMonth() + 1}`
	});

	return budgets.map((b) => ({
		id: b.id,
		amount: b.amount,
		year: b.year,
		month: b.month,
		user_id: b.user,
		category_id: b.category
	}));
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
