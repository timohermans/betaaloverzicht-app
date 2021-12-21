import { writable } from 'svelte/store';
import type { AuthUser } from '$lib/auth';
import type { ById, Category, Transaction, Budget } from '$lib/types';

export const isAuthenticated = writable(false);

export const user = writable<AuthUser>();

export const popupOpen = writable(false);

export const error = writable();

export const date = writable<Date>(new Date());
export const transactions = writable<Transaction[]>([]);
export const categories = writable<Category[]>([]);
export const budgetsByCategoryId = writable<ById<Budget>>({});

export function setBudgets(budgets: Budget[]): void {
	budgetsByCategoryId.set(budgets.reduce((obj, b) => ({ ...obj, [b.category_id]: b }), {}));
}
