export const toShortDate = (date: Date): string =>
	`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const toMonthQueryString = (date: Date): string =>
	`year=${date.getFullYear()}&month=${date.getMonth() + 1}`;

export function get_month_query_params(month: Date): { start: Date; end: Date } {
	const start = new Date(month.getFullYear(), month.getMonth(), 1);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	return { start, end };
}

