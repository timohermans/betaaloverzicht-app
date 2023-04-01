import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url, locals }) => {
	const budgetRoute = '/';
	const query = new URLSearchParams(url.searchParams);
	const year = query.has('year') ? +(query.get('year') ?? 0) : new Date().getFullYear();
	const month = query.has('month') ? +(query.get('month') ?? 0) - 1 : new Date().getMonth();

	if (url.pathname === budgetRoute && (!query.has('year') || !query.has('month'))) {
		throw redirect(301, `${url.pathname}?year=${year}&month=${month}`);
	}

	const date = new Date(year, month, 1);

	return {
		date,
		user: {
			id: locals.pb.authStore.model?.id,
			name: locals.pb.authStore.model?.name
		}
	};
};
