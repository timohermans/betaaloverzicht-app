import { writable } from 'svelte/store';
import type { ById, Category, Transaction, Budget } from '$lib/types';
import { pb } from './api';
import { Collections } from './book_types';

export const current_user = writable(pb.authStore.model);

pb.authStore.onChange((_, model) => {
	current_user.set(model);
});

export const locale = writable('nl');
export const date = writable<Date | null>(null);
export const transactions = writable<Transaction[]>([]);
export const transactionsFromAllIbans = writable<Transaction[]>([]);
export const categories = writable<Category[]>([]);
export const budgetsByCategoryId = writable<ById<Budget>>({});

export function setBudgets(budgets: Budget[]): void {
	budgetsByCategoryId.set(budgets.reduce((obj, b) => ({ ...obj, [b.category_id]: b }), {}));
}
