import { getTransactionsOf } from '$lib/api';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url, locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(307, '/login');
	}

	const { date, user } = await parent();

	const transactions = await getTransactionsOf(date, locals.pb);
	date.setMonth(date.getMonth() - 1);
	const transactionsPreviousMonth = await getTransactionsOf(date, locals.pb);
	// TODO: get these bad boys
	// getBudgetsOf($date).then((b) => setBudgets(b));
	// getCategories().then((c) => categories.set(c));

	return {
		date,
		user,
		transactions,
		transactionsPreviousMonth
	};
};
