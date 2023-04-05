export const uniqWith = <T>(arr: Array<T>, fn: (a: T, b: T) => boolean) =>
	arr.filter((element, index) => arr.findIndex((step) => fn(element, step)) === index);

export const sortBy = <T>(key: keyof T) => {
	return (a: T, b: T) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
};
