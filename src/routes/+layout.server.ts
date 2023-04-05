import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url, locals }) => {
	const query = url.searchParams;
	const today = new Date();
	const year = query.has('year') ? +(query.get('year') ?? 0) : today.getFullYear();
	const month = query.has('month') ? +(query.get('month') ?? 0) - 1 : today.getMonth();
	const date = new Date(year, month, 1);

	return {
		date,
		user: {
			id: locals.pb.authStore.model?.id,
			name: locals.pb.authStore.model?.name
		}
	};
};
