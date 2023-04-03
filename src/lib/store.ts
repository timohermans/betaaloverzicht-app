import { writable } from 'svelte/store';
import type { ById, Category, Transaction, Budget } from '$lib/types';

export const locale = writable('nl');
export const date = writable<Date>(new Date());
export const transactions = writable<Transaction[]>([]);
export const transactionsFromAllIbans = writable<Transaction[]>([]);
export const categories = writable<Category[]>([]);
export const budgetsByCategoryId = writable<ById<Budget>>({});

export function setBudgets(budgets: Budget[]): void {
	budgetsByCategoryId.set(budgets.reduce((obj, b) => ({ ...obj, [b.category_id]: b }), {}));
}
