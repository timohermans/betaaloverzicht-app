import {
	type CategoriesResponse,
	type TransactionsResponse,
	Collections,
	type BudgetsResponse,
	type TransactionsRecord
} from '$lib/book_types';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Budget, Category, Transaction } from '$lib/types';
import type PocketBase from 'pocketbase';
import { parse } from '$lib/transaction';
import type { ClientResponseError } from 'pocketbase';

export const load: PageServerLoad = async ({ parent, locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(307, '/login');
	}

	const { date, user } = await parent();
	const transactions = await getTransactionsOf(date, locals.pb);
	const budgets = getBudgetsOf(date, locals.pb);
	const categories = getCategories(locals.pb);

	return {
		date,
		user,
		transactions,
		budgets,
		categories
	};
};

async function getTransactionsOf(month: Date, book: PocketBase): Promise<Transaction[]> {
	const { start, end } = getMonthQueryParams(month);

	const results = await book
		.collection(Collections.Transactions)
		.getFullList<TransactionsResponse<{ category: CategoriesResponse }>>({
			filter: `date_transaction >= "${start.toISOString()}" && date_transaction <= "${end.toISOString()}"`,
			sort: 'date_transaction,name_other_party',
			expand: 'category'
		});

	const mapped = results.map((t) => {
		let category: Category | undefined = undefined;

		if (t.expand?.category) {
			category = {
				id: t.expand.category.id,
				name: t.expand.category.name
			};
		}
		return {
			id: t.id,
			currency: t.currency,
			date_transaction: t.date_transaction,
			iban: t.iban,
			code: t.code,
			description: t.description,
			follow_number: t.follow_number?.toString() ?? '',
			iban_other_party: t.iban_other_party,
			name_other_party: t.name_other_party,
			amount_after_transaction: t.amount_after_transaction,
			amount: t.amount,
			category_id: t.category,
			category
		};
	});

	return mapped;
}

function getMonthQueryParams(month: Date): { start: Date; end: Date } {
	const start = new Date(month.getFullYear(), month.getMonth(), 1);
	const end = new Date(start);
	end.setMonth(end.getMonth() + 1);
	end.setDate(end.getDate() - 1);
	return { start, end };
}

async function getBudgetsOf(month: Date, pb: PocketBase): Promise<Budget[]> {
	const budgets = await pb.collection(Collections.Budgets).getFullList<BudgetsResponse>({
		filter: `year=${month.getFullYear()} && month=${month.getMonth() + 1}`
	});

	return budgets.map((b) => ({
		id: b.id,
		amount: b.amount,
		year: b.year,
		month: b.month,
		user_id: b.user,
		category_id: b.category
	}));
}

async function getCategories(pb: PocketBase): Promise<Category[]> {
	const categories = await pb.collection(Collections.Categories).getFullList<CategoriesResponse>({
		sort: 'name'
	});
	return categories.map((c) => ({
		id: c.id,
		name: c.name
	}));
}

export const actions: Actions = {
	transactions_file_upload: async ({ request, locals }) => {
		const supportedTypes = ['application/vnd.ms-excel', 'text/csv'];
		const transactionRepo = locals.pb.collection(Collections.Transactions);
		const data = await request.formData();

		const file = data.get('file') as File;

		if (!file.size) {
			return fail(400, { missing: true });
		}

		if (!supportedTypes.includes(file.type)) {
			return fail(400, { invalid: true });
		}

		const transactions = await parse(await file.text());

		const creates = transactions.map((t) =>
			transactionRepo
				.create<TransactionsRecord>(
					{
						amount: t.amount,
						currency: t.currency,
						date_transaction: t.date_transaction,
						iban: t.iban,
						code: t.code,
						description: t.description,
						follow_number: +t.follow_number,
						iban_other_party: t.iban_other_party,
						name_other_party: t.name_other_party,
						amount_after_transaction: t.amount_after_transaction,
						user: locals.pb.authStore.model?.id
					} as TransactionsRecord,
					{
						$autoCancel: false
					}
				)
				.catch((error: ClientResponseError) => {
					if (Object.keys(error.response).length === 0) return;
					if (error.response?.data?.code?.code === 'validation_not_unique') return;
				})
		);

		await Promise.all(creates);
	},
	assign_category: async ({ request, locals }) => {
		const categoryRepo = locals.pb.collection(Collections.Categories);
		const transactionRepo = locals.pb.collection(Collections.Transactions);
		const data = await request.formData();
		const name = data.get('name');
		const transaction_ids = data.getAll('transaction_id');

		if (!name) throw fail(400, { name, no_name: true });
		const transactionsInBook = await transactionRepo.getFullList<TransactionsResponse>({
			filter: transaction_ids.map((id) => `id = "${id}"`).join(' || ')
		});
		if (transactionsInBook.length == 0) throw fail(400, { name, invalid_transaction: true });

		const categoryFoundInDb = await categoryRepo.getFullList<CategoriesResponse>({
			filter: `name = "${name}"`
		});

		let category: CategoriesResponse;
		if (categoryFoundInDb.length == 0) {
			category = await categoryRepo.create<CategoriesResponse>({
				name,
				user: locals.pb.authStore.model?.id
			});
		} else {
			category = categoryFoundInDb[0];
		}

		const updates = transactionsInBook.map((transaction) => {
			return transactionRepo.update<TransactionsResponse>(
				transaction.id,
				{
					category: category.id
				},
				{ $autoCancel: false }
			);
		});
		await Promise.all(updates);

		return {
			category: {
				id: category.id,
				name: category.name
			} as Category
		};
	}
};
