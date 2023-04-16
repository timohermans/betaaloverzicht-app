import { writable } from 'svelte/store';

export const locale = writable('nl');
export const date = writable<Date>(new Date());
