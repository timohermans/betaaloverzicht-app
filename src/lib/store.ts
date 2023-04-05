import { writable } from 'svelte/store';
import type { Category, Transaction } from '$lib/types';

export const locale = writable('nl');
export const date = writable<Date>(new Date());
export const transactions = writable<Transaction[]>([]);
export const transactionsFromAllIbans = writable<Transaction[]>([]);
export const categories = writable<Category[]>([]);

