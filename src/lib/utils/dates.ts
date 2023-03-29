export const toShortDate = (date: Date): string =>
	`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
