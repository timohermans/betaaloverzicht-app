import type { Auth0Client } from '@auth0/auth0-spa-js';
import auth from '$lib/auth';
import type { Budget, Transaction, Category } from '$lib/types';
import { toShortDate } from '$lib/utils/dates';
import { variables } from "./variables";

export interface ClientConfig<T> {
	method?: 'GET' | 'POST' | 'PATCH';
	body?: Partial<T>;
	filterQueryParams?: ClientQueryParam<T>[];
	orderQueryParam?: ClientOrderQueryParam<T>[];
	selectQueryParam?: ClientSelectQueryParam<T>[];
	requestSingleResult?: boolean;
	requestReturnObject?: boolean;
	onConflict?: {
		property: keyof T | Array<keyof T>;
		resolution: 'merge-duplicates' | 'ignore-duplicates';
	};
}

interface ClientQueryParam<T> {
	property: keyof T;
	operator: 'gte' | 'lte' | 'eq';
	value: string;
}

interface ClientOrderQueryParam<T> {
	property: keyof T;
}

interface ClientSelectQueryParam<T> {
	property: keyof T | '*';
	relationshipTableName?: string;
	relationshipProperties?: string[];
}

export async function client<T>(
	endpoint: string,
	config?: ClientConfig<T>
): Promise<T | T[] | void> {
	if (!endpoint.startsWith('/')) throw new Error('Invalid endpoint specified');

	const auth0 = await auth.createClient();
	const url = buildUrlFrom(endpoint, config);
	const requestInit: RequestInit = {
		headers: {
			...(await getBaseHeaders(auth0)),
			...(config?.requestSingleResult ? { Accept: 'application/vnd.pgrst.object+json' } : {}),
			...buildPreferHeaderFrom(config)
		}
	};
	if (config?.body) requestInit.body = JSON.stringify(config.body);
	if (config?.method) requestInit.method = config.method;

	const result = await fetch(url, requestInit);

	if (result.status === 204) {
		return;
	}

	return await result.json();
}

function buildUrlFrom<T>(
	endpoint: string,
	{
		selectQueryParam = [],
		filterQueryParams = [],
		orderQueryParam = [],
		onConflict
	}: ClientConfig<T> = {}
): string {
	const baseUrl = variables.apiUrl;
	const url = [baseUrl, endpoint];
	const queryParams = [
		buildSelectQueryParamsFrom(selectQueryParam),
		...filterQueryParams.map(
			(f) => `${f.property}=${f.operator ? `${f.operator}.` : ''}${f.value}`
		),
		orderQueryParam.map(({ property: p }, i) => (i === 0 ? `order=${p}` : p)).join(','),
		onConflict
			? `on_conflict=${
					Array.isArray(onConflict.property) ? onConflict.property.join(',') : onConflict.property
			  }`
			: ''
	].filter(Boolean);

	return url.join('') + (queryParams.length > 0 ? '?' : '') + queryParams.join('&');
}

function buildSelectQueryParamsFrom<T>(selectQueryParams: ClientSelectQueryParam<T>[]): string {
	if (selectQueryParams.length === 0) return '';

	return (
		'select=' +
		selectQueryParams
			.map(({ property, relationshipTableName, relationshipProperties = [] }) => {
				if (!relationshipTableName || relationshipProperties.length === 0) return property;

				return `${property}:${relationshipTableName}(${relationshipProperties.join(',')})`;
			})
			.join(',')
	);
}

function buildPreferHeaderFrom<T>(config: ClientConfig<T>): { Prefer?: string } {
	const prefers = [
		config?.requestReturnObject ? 'return=representation' : '',
		config?.onConflict ? `resolution=${config.onConflict.resolution}` : ''
	].filter(Boolean);

	return prefers.length > 0 ? { Prefer: prefers.join(',') } : {};
}

async function getBaseHeaders(auth0: Auth0Client): Promise<HeadersInit> {
	return {
		Authorization: `Bearer ${await auth0.getTokenSilently({ audience: 'http://localhost:2222' })}`,
		'Content-Type': 'application/json'
	};
}

function getMonthQueryParams(month: Date): { start: string; end: string } {
	const start = new Date(month.getFullYear(), month.getMonth(), 1);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	end.setDate(end.getDate() - 1);
	return { start: toShortDate(start), end: toShortDate(end) };
}

export async function getTransactionsOf(month: Date): Promise<Transaction[]> {
	const { start, end } = getMonthQueryParams(month);

	return (await client<Transaction>('/transactions', {
		selectQueryParam: [
			{ property: '*' },
			{
				property: 'category',
				relationshipProperties: ['id', 'name'],
				relationshipTableName: 'categories'
			}
		],
		filterQueryParams: [
			{ property: 'date_transaction', operator: 'gte', value: start },
			{ property: 'date_transaction', operator: 'lte', value: end }
		],
		orderQueryParam: [{ property: 'date_transaction' }, { property: 'name_other_party' }]
	})) as Transaction[];
}

export async function getAllTransactions(): Promise<Transaction[]> {
	return (await client<Transaction>('/transactions', {
		selectQueryParam: [
			{ property: '*' },
			{
				property: 'category',
				relationshipProperties: ['id', 'name'],
				relationshipTableName: 'categories'
			}
		]
	})) as Transaction[];
}

export async function upsertCategory(name: string): Promise<Category> {
	return (await client<Category>('/categories', {
		body: { name },
		method: 'POST',
		onConflict: {
			property: 'name',
			resolution: 'merge-duplicates'
		},
		requestSingleResult: true,
		requestReturnObject: true
	})) as Category;
}

export async function assignCategoryTo(transactionId: number, categoryId: number): Promise<void> {
	await client<Transaction>('/transactions', {
		filterQueryParams: [{ property: 'id', value: transactionId.toString(), operator: 'eq' }],
		method: 'PATCH',
		body: { category_id: categoryId }
	});
}

export async function getCategories(): Promise<Category[]> {
	return (await client<Category>('/categories')) as Category[];
}

export async function getBudgetsOf(month: Date): Promise<Budget[]> {
	return (await client<Budget>('/budgets', {
		filterQueryParams: [
			{ property: 'year', operator: 'eq', value: month.getFullYear().toString() },
			{ property: 'month', operator: 'eq', value: (month.getMonth() + 1).toString() }
		]
	})) as Budget[];
}

export async function upsertBudget(
	categoryId: number,
	amount: number,
	monthDate: Date
): Promise<Budget> {
	const year = monthDate.getFullYear();
	const month = monthDate.getMonth() + 1;

	return (await client<Budget>('/budgets', {
		method: 'POST',
		body: { year, month, category_id: categoryId, amount },
		onConflict: { property: ['category_id', 'year', 'month'], resolution: 'merge-duplicates' },
		requestSingleResult: true,
		requestReturnObject: true
	})) as Budget;
}
