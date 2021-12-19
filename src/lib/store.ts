import { writable } from 'svelte/store';
import type { Budget } from '$lib/api';
import type { AuthUser } from '$lib/auth';
import type { Category, Transaction } from '$lib/transaction';

export type ById<T> = { [id: number | string]: T };

export const isAuthenticated = writable(false);

export const user = writable<AuthUser>();

export const popupOpen = writable(false);

export const error = writable();

export const transactions = writable<Transaction[]>([]);
export const categories = writable<Category[]>([]);
export const budgetsByCategoryId = writable<ById<Budget>>({});

export function setBudgets(budgets: Budget[]): void {
	budgetsByCategoryId.set(budgets.reduce((obj, b) => ({ ...obj, [b.category_id]: b }), {}));
}
