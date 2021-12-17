import { writable } from 'svelte/store';
import type { AuthUser } from './auth';
import type {Category, Transaction} from './transaction';

export const isAuthenticated = writable(false);

export const user = writable<AuthUser>();

export const popupOpen = writable(false);

export const error = writable();

export const transactions = writable<Transaction[]>([]);
export const categories = writable<Category[]>([]);
