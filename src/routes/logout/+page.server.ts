import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: ({ locals }) => {
		locals.pb.authStore.clear();
		throw redirect(301, '/login');
	}
};
