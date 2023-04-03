export const toShortDate = (date: Date): string =>
	`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const toMonthQueryString = (date: Date): string =>
	`year=${date.getFullYear()}&month=${date.getMonth() + 1}`;
