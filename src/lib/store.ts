import { derived, writable } from 'svelte/store';
import type { Category, Transaction } from '$lib/types';

export const locale = writable('nl');
export const date = writable<Date>(new Date());
export const transactions = writable<Transaction[]>();
export const transactionsFromAllIbans = writable<Transaction[]>([]);
export const categories = writable<Category[]>();

export const ibans = derived(transactionsFromAllIbans, (transactions) => {
	let iban_by_frequency: { [key: string]: number } = {};
	return transactions
		.reduce((iban_list, transaction) => {
			if (iban_list.length === 0) iban_by_frequency = {};
			if (!iban_list.includes(transaction.iban)) {
				iban_by_frequency[transaction.iban] = 0;
				iban_list.push(transaction.iban);
			}
			iban_by_frequency[transaction.iban]++;
			return iban_list;
		}, [] as string[])
		.sort((iban1, iban2) => iban_by_frequency[iban2] - iban_by_frequency[iban1]);
});
