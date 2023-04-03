import type { Budget, Transaction, Category } from '$lib/types';
import type PocketBase from 'pocketbase';

export async function getAllTransactions(): Promise<Transaction[]> {
	// return (await client<Transaction>('/transactions', {
	// 	selectQueryParam: [
	// 		{ property: '*' },
	// 		{
	// 			property: 'category',
	// 			relationshipProperties: ['id', 'name'],
	// 			relationshipTableName: 'categories
	// 		}
	// 	]
	// })) as Transaction[];
	return [];
}

export async function upsertCategory(name: string, pb: PocketBase): Promise<Category> {
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

export async function assignCategoryTo(
	transactionId: number,
	categoryId: number,
	pb: PocketBase
): Promise<void> {
	// await client<Transaction>('/transactions', {
	// 	filterQueryParams: [{ property: 'id', value: transactionId.toString(), operator: 'eq' }],
	// 	method: 'PATCH',
	// 	body: { category_id: categoryId }
	// });
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
