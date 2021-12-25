import {
	assignCategoryTo,
	client,
	ClientConfig,
	getBudgetsOf,
	getTransactionsOf,
	upsertBudget,
	upsertCategory
} from '$lib/api';
import type { Transaction } from '$lib/types';

describe('api', () => {
	let mock: jest.SpyInstance;
	beforeEach(() => {
		mock = jest
			.spyOn(window, 'fetch')
			.mockImplementation(() => Promise.resolve(new Response('{}', { status: 200 })));
	});

	afterEach(() => {
		mock.mockRestore();
	});

	describe('client', () => {
		it('throws when endpoint does not start with a forward slash', async () => {
			try {
				await client('transactions');
			} catch (error) {
				expect(error).not.toBeNull();
			}
		});

		it('calls fetch with the correct headers for the api', async () => {
			await client('/transactions');

			expect(window.fetch).toHaveBeenCalledWith('http://localhost:2222/transactions', {
				headers: {
					Authorization: 'Bearer silent-token',
					'Content-Type': 'application/json'
				}
			});
		});

		it('adds query parameters to the url', async () => {
			await client<Transaction>('/transactions', {
				filterQueryParams: [
					{ property: 'date_transaction', value: '2021-01-01', operator: 'gte' },
					{ property: 'date_transaction', value: '2021-01-31', operator: 'lte' }
				]
			});

			expect(window.fetch).toHaveBeenCalledWith(
				'http://localhost:2222/transactions?date_transaction=gte.2021-01-01&date_transaction=lte.2021-01-31',
				expect.anything()
			);
		});

		it('adds order query parameters to the url', async () => {
			const config: ClientConfig<Transaction> = {
				filterQueryParams: [{ property: 'id', value: '1', operator: 'eq' }],
				orderQueryParam: [{ property: 'date_transaction' }]
			};

			await client<Transaction>('/transactions', config);

			expect(window.fetch).toHaveBeenCalledWith(
				'http://localhost:2222/transactions?id=eq.1&order=date_transaction',
				expect.anything()
			);
		});

		it('adds multiple order query parameters in the exact same order as supplied', async () => {
			const config: ClientConfig<Transaction> = {
				filterQueryParams: [{ property: 'id', value: '1', operator: 'eq' }],
				orderQueryParam: [{ property: 'date_transaction' }, { property: 'iban' }]
			};

			await client<Transaction>('/transactions', config);

			expect(window.fetch).toHaveBeenCalledWith(
				'http://localhost:2222/transactions?id=eq.1&order=date_transaction,iban',
				expect.anything()
			);
		});

		it('adds select query params to select a subset of properties from the server', async () => {
			const config: ClientConfig<Transaction> = {
				filterQueryParams: [{ property: 'id', operator: 'eq', value: '1' }],
				orderQueryParam: [{ property: 'date_transaction' }],
				selectQueryParam: [
					{ property: '*' },
					{ property: 'iban' },
					{
						property: 'category',
						relationshipTableName: 'categories',
						relationshipProperties: ['id', 'name']
					}
				]
			};

			await client<Transaction>('/transactions', config);

			expect(window.fetch).toHaveBeenCalledWith(
				'http://localhost:2222/transactions?select=*,iban,category:categories(id,name)&id=eq.1&order=date_transaction',
				expect.anything()
			);
		});
	});

	describe('getTransactionsOf', () => {
		it('gets the transactions of a specific month', async () => {
			await getTransactionsOf(new Date(2021, 0, 16));

			expect(mock).toHaveBeenCalledWith(
				'http://localhost:2222/transactions?select=*,category:categories(id,name)&date_transaction=gte.2021-1-1&date_transaction=lte.2021-1-31&order=date_transaction,name_other_party',
				{ headers: { Authorization: expect.anything(), 'Content-Type': 'application/json' } }
			);
		});
	});

	describe('upsertCategory', () => {
		it('saves or updates the category', async () => {
			await upsertCategory('Boodschappen');

			expect(mock).toHaveBeenCalledWith('http://localhost:2222/categories?on_conflict=name', {
				body: JSON.stringify({ name: 'Boodschappen' }),
				method: 'POST',
				headers: {
					Authorization: expect.anything(),
					'Content-Type': expect.anything(),
					Prefer: 'return=representation,resolution=merge-duplicates',
					Accept: 'application/vnd.pgrst.object+json'
				}
			});
		});
	});

	describe('assignCategoryTo', () => {
		it('assigns a category ID to a certain transaction ID', async () => {
			await assignCategoryTo(1, 2);

			expect(mock).toHaveBeenCalledWith('http://localhost:2222/transactions?id=eq.1', {
				body: JSON.stringify({ category_id: 2 }),
				headers: {
					Authorization: expect.anything(),
					'Content-Type': expect.anything()
				},
				method: 'PATCH'
			});
		});
	});

	describe('getBudgetsOf', () => {
		it('gets the transactions of a specific month', async () => {
			await getBudgetsOf(new Date(2021, 0, 16));

			expect(mock).toHaveBeenCalledWith('http://localhost:2222/budgets?year=eq.2021&month=eq.1', {
				headers: { Authorization: expect.anything(), 'Content-Type': 'application/json' }
			});
		});
	});

	describe('upsertBudget', () => {
		it('saves or updates the budget', async () => {
			const categoryId = 1;
			const budget = 20.5;
			const month = new Date(2021, 0, 16);

			await upsertBudget(categoryId, budget, month);

			expect(mock).toHaveBeenCalledWith(
				'http://localhost:2222/budgets?on_conflict=category_id,year,month',
				{
					body: JSON.stringify({ year: 2021, month: 1, category_id: 1, amount: 20.5 }),
					method: 'POST',
					headers: {
						Accept: 'application/vnd.pgrst.object+json',
						Authorization: expect.anything(),
						'Content-Type': expect.anything(),
						Prefer: 'return=representation,resolution=merge-duplicates'
					}
				}
			);
		});
	});
});
