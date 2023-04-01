import { derived } from 'svelte/store';
import { locale } from './store';
import { translationMap, type Translation } from './translations';

export const locales = () => Object.keys(translationMap);

function translate(locale: string, key: keyof Translation, vars: { [key: string]: string } = {}) {
	// Let's throw some errors if we're trying to use keys/locales that don't exist.
	// TODO: We could improve this by using Typescript and/or fallback values.
	if (!key) throw new Error('no key provided to $t()');
	if (!locale) throw new Error(`no translation for key "${key}"`);

	let text = translationMap[locale][key];

	if (!text) throw new Error(`no translation found for ${locale}.${key}`);

	Object.keys(vars).map((k) => {
		const regex = new RegExp(`{{${k}}}`, 'g');
		text = text.replace(regex, vars[k]);
	});

	return text;
}

export const t = derived(
	locale,
	($locale) =>
		(key: keyof Translation, vars = {}) =>
			translate($locale, key, vars)
);
