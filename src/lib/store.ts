import { writable } from 'svelte/store';
import type { AuthUser } from './auth';

export const isAuthenticated = writable(false);

export const user = writable<AuthUser>();

export const popupOpen = writable(false);

export const error = writable();
