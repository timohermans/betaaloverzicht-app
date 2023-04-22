import {
	type CategoriesResponse,
	type TransactionsResponse,
	Collections,
	type TransactionsRecord
} from '$lib/book_types';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Category, Transaction } from '$lib/types';
import type PocketBase from 'pocketbase';
import { compute_transaction_summary_of, extract_ibans_from, parse } from '$lib/transaction';
import type { ClientResponseError } from 'pocketbase';
import { get_month_query_params } from '$lib/utils/dates';

export const load: PageServerLoad = async ({ parent, locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(307, '/login');
	}

	const { date, user } = await parent();
	const transactions = await get_transactions_of(date, locals.pb);
	const categories = await get_categories(locals.pb);
	const ibans = extract_ibans_from(transactions);
	const iban = ibans[0];

	const summary = compute_transaction_summary_of(iban, date, transactions, ibans);

	return {
		date,
		user,
		categories,
		ibans,
		iban,
		summary
	};
};

async function get_transactions_of(month: Date, book: PocketBase): Promise<Transaction[]> {
	const previous_month = new Date(month);
	previous_month.setMonth(month.getMonth() - 1);
	const { start } = get_month_query_params(previous_month);
	const { end } = get_month_query_params(month);

	const results = await book
		.collection(Collections.Transactions)
		.getFullList<TransactionsResponse<{ category: CategoriesResponse }>>({
			filter: `date_transaction >= "${date_to_string(
				start
			)}" && date_transaction <= "${date_to_string(end)}"`,
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
			authorization_code: t.authorization_code,
			follow_number: t.follow_number?.toString() ?? '',
			iban_other_party: t.iban_other_party,
			name_other_party: t.name_other_party,
			amount_after_transaction: t.amount_after_transaction,
			amount: t.amount,
			category_id: t.category,
			category
		} satisfies Transaction;
	});

	return mapped;
}

function date_to_string(date: Date): string {
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // add 1 to the month to get a 1-based index
	return `${year}-${month.toString().padStart(2, '0')}-01`;
}

async function get_categories(pb: PocketBase): Promise<Category[]> {
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
		const supported_types = ['application/vnd.ms-excel', 'text/csv'];
		const transaction_repo = locals.pb.collection(Collections.Transactions);
		const data = await request.formData();

		const file = data.get('file') as File;

		if (!file.size) {
			return fail(400, { missing: true });
		}

		if (!supported_types.includes(file.type)) {
			return fail(400, { invalid: true });
		}

		const transactions = await parse(await file.text());

		const creates = transactions.map((t) =>
			transaction_repo
				.create<TransactionsRecord>(
					{
						amount: t.amount,
						currency: t.currency,
						date_transaction: t.date_transaction,
						iban: t.iban,
						code: t.code,
						authorization_code: t.authorization_code,
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
		const category_repo = locals.pb.collection(Collections.Categories);
		const transaction_repo = locals.pb.collection(Collections.Transactions);
		const data = await request.formData();
		const name = data.get('name');
		const transaction_ids = data.getAll('transaction_id');

		if (!name) throw fail(400, { name, no_name: true });
		const transactions_in_book = await transaction_repo.getFullList<TransactionsResponse>({
			filter: transaction_ids.map((id) => `id = "${id}"`).join(' || ')
		});
		if (transactions_in_book.length == 0) throw fail(400, { name, invalid_transaction: true });

		const category_found_in_book = await category_repo.getFullList<CategoriesResponse>({
			filter: `name = "${name}"`
		});

		let category: CategoriesResponse;
		if (category_found_in_book.length == 0) {
			category = await category_repo.create<CategoriesResponse>({
				name,
				user: locals.pb.authStore.model?.id
			});
		} else {
			category = category_found_in_book[0];
		}

		const updates = transactions_in_book.map((transaction) => {
			return transaction_repo.update<TransactionsResponse>(
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
