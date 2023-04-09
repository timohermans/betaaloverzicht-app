import { Collections } from '$lib/book_types';
import { redirect, type Actions, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = ({ locals }) => {
	if (locals.pb.authStore.isValid) {
		throw redirect(301, '/');
	}
};

export const actions: Actions = {
	default: async (event) => {
		const pb = event.locals.pb;

		const data = await event.request.formData();

		const username = data.get('username');
		const password = data.get('password');

		if (username && password) {
			await pb
				.collection(Collections.Users)
				.authWithPassword(username.toString(), password.toString());
		}
	}
};
