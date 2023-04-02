import { getBudgetsOf, getCategories, getTransactionsOf } from '$lib/api';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url, locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(307, '/login');
	}

	const { date, user } = await parent();
	const transactions = await getTransactionsOf(date, locals.pb);
	const budgets = getBudgetsOf(date, locals.pb);
	const categories = getCategories(locals.pb);

	return {
		date,
		user,
		transactions,
		budgets,
		categories
	};
};
