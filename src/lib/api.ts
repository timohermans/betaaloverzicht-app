import type { Auth0Client } from '@auth0/auth0-spa-js';
import auth from './auth';
import type { Transaction, Category } from './transaction';

export async function getTransactionsOf(month: Date, auth0: Auth0Client): Promise<Transaction[]> {
	const start = new Date(month.getFullYear(), month.getMonth(), 1);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	end.setDate(end.getDate() - 1);
	const toShortDate = (date: Date) =>
		`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

	const response = await fetch(
		`http://localhost:2222/transactions?date_transaction=gte.${toShortDate(
			start
		)}&date_transaction=lte.${toShortDate(
			end
		)}&order=date_transaction,name_other_party&select=*,category:categories(id,name)`,
		await auth.getAuthFetchConfig(auth0)
	);

	return await response.json();
}

export async function upsertCategory(name: string, auth0: Auth0Client): Promise<Category> {
	const authConfig = await auth.getAuthFetchConfig(auth0);
	const categoryResult = await fetch(`http://localhost:2222/categories?on_conflict=name`, {
		headers: {
			...authConfig.headers,
			Prefer: 'return=representation,resolution=merge-duplicates',
			Accept: 'application/vnd.pgrst.object+json'
		},
		method: 'POST',
		body: JSON.stringify({ name })
	});
	return await categoryResult.json();
}

export async function assignCategoryTo(
	transaction: Transaction,
	category: Category,
	auth0: Auth0Client
): Promise<void> {
	const authConfig = await auth.getAuthFetchConfig(auth0);
	await fetch(`http://localhost:2222/transactions?id=eq.${transaction.id}`, {
		...authConfig,
		method: 'PATCH',
		body: JSON.stringify({ category_id: category.id })
	});
}
