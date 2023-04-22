import * as Papa from 'papaparse';
import type { Transaction } from './types';
import { get_month_query_params } from './utils/dates';

const headerMap = {
	['IBAN/BBAN']: 'iban',
	['Munt']: 'currency',
	['Volgnr']: 'follow_number',
	['Datum']: 'date_transaction',
	['Bedrag']: 'amount',
	['Saldo na trn']: 'amount_after_transaction',
	['Tegenrekening IBAN/BBAN']: 'iban_other_party',
	['Naam tegenpartij']: 'name_other_party',
	['Machtigingskenmerk']: 'authorization_code',
	['Omschrijving-1']: 'description_1',
	['Omschrijving-2']: 'description_2',
	['Omschrijving-3']: 'description_3'
};

const mapParseResultToApiModel = (parseResult) => {
	return parseResult.data.map((rawTransaction) =>
		Object.keys(rawTransaction)
			.filter((header) => headerMap[header] != null)
			.reduce(
				(transaction, header) => {
					const newHeader = headerMap[header];

					if (newHeader && newHeader.startsWith('description')) {
						transaction.description += rawTransaction[header];
					} else if (newHeader) {
						if (newHeader === 'follow_number') {
							transaction.code = transaction.iban + rawTransaction[header];
						}
						transaction[newHeader] = rawTransaction[header];
					}

					return transaction;
				},
				{ description: '' } as Transaction
			)
	);
};

export function parse(file: string): Promise<Transaction[]> {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (parseResult) => {
				resolve(mapParseResultToApiModel(parseResult));
			},
			error: (error) => {
				reject(error);
			}
		});
	});
}

export const to_number = (amount: string) => +amount.replace(',', '.');

interface TransactionsByWeek {
	[week: number]: Transaction[];
}

export function split_transactions_by_week(transactions: Transaction[]): TransactionsByWeek {
	const sortedTransactions = transactions.sort((a, b) => {
		return Date.parse(a.date_transaction) - Date.parse(b.date_transaction);
	});

	const weeks: TransactionsByWeek = {};
	sortedTransactions.forEach((transaction) => {
		const transactionDate = new Date(transaction.date_transaction);
		const weekNumber = get_week_number(transactionDate);
		const weekKey = weekNumber;

		if (!weeks[weekKey]) {
			weeks[weekKey] = [];
		}

		weeks[weekKey].push(transaction);
	});

	return weeks;
}

export function get_week_number(date: Date): number {
	const dowMondayOffset = 1;
	const newYear = new Date(date.getFullYear(), 0, 1);
	let day = newYear.getDay() - dowMondayOffset; //the day of week the year begins on
	day = day >= 0 ? day : day + 7;
	const daynum =
		Math.floor(
			(date.getTime() -
				newYear.getTime() -
				(date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
				86400000
		) + 1;
	let weeknum;
	//if the year starts before the middle of a week
	if (day < 4) {
		weeknum = Math.floor((daynum + day - 1) / 7) + 1;
		if (weeknum > 52) {
			const nYear = new Date(date.getFullYear() + 1, 0, 1);
			let nday = nYear.getDay() - dowMondayOffset;
			nday = nday >= 0 ? nday : nday + 7;
			/*if the next year starts before the middle of
              the week, it is week #1 of that year*/
			weeknum = nday < 4 ? 1 : 53;
		}
	} else {
		weeknum = Math.floor((daynum + day - 1) / 7);
	}
	return weeknum;
}

export function extract_ibans_from(transactions: Transaction[]) {
	let iban_by_frequency: { [key: string]: number } = {};
	return transactions
		.reduce((iban_list, transaction) => {
			if (iban_list.length === 0) iban_by_frequency = {};
			if (!iban_list.includes(transaction.iban)) {
				iban_by_frequency[transaction.iban] = 0;
				iban_list.push(transaction.iban);
			}
			iban_by_frequency[transaction.iban]++;
			return iban_list;
		}, [] as string[])
		.sort((iban1, iban2) => iban_by_frequency[iban2] - iban_by_frequency[iban1]);
}

export function is_variable_expense(t: Transaction) {
	return t.amount.startsWith('-') && !t.authorization_code;
}

export function compute_transaction_summary_of(
	iban: string,
	date: Date,
	transactions: Transaction[],
	ibans: string[] = []
) {
	const variable_expenses_per_week = create_initial_week_map_for(date);
	const summary = {
		transactions: [] as Transaction[],
		prior_actual_income: 0,
		prior_fixed_expenses: 0,
		total_income: 0,
		actual_income: 0,
		total_expenses: 0,
		total_savings_used: 0,
		total_fixed: 0,
		total_saved: 0,
		total_variable_expenses: 0,
		variable_expenses_per_week
	};
	if (transactions.length === 0) return summary;

	const target_month = date.getMonth();

	return transactions.reduce((acc, t) => {
		if (t.iban !== iban) return acc;

		const date_t = new Date(t.date_transaction);
		const amount = to_number(t.amount);

		if (date_t.getMonth() === target_month) {
			// "this" month's transactions. Used for expenses and statistics
			const week_number = get_week_number(date_t);

			acc.transactions.push(t);

			if (is_income(t)) {
				acc.total_income += amount;

				if (is_from_other_party(t, ibans)) {
					acc.actual_income += amount;
				} else {
					acc.total_savings_used += amount;
				}
			} else {
				acc.total_expenses += amount;

				if (is_from_own_account(t, ibans)) acc.total_saved += amount;
				else if (is_fixed(t)) acc.total_fixed += amount;
				else {
					acc.variable_expenses_per_week[week_number] += amount;
					acc.total_variable_expenses += amount;
				}
			}
		} else {
			// "prior" month's transactions. Used for budget
			if (is_income(t) && is_from_other_party(t, ibans)) acc.prior_actual_income += amount;

			if (!is_income(t) && (is_fixed(t) || is_from_own_account(t, ibans)))
				acc.prior_fixed_expenses += amount;
		}

		return acc;
	}, summary);
}

function create_initial_week_map_for(date: Date) {
	const { start, end } = get_month_query_params(date);
	end.setDate(end.getDate() - 1);

	const weeks: { [week: number]: number } = {};

	for (let day = start.getDate(); day <= end.getDate(); day++) {
		const day_in_month = new Date(date.getFullYear(), date.getMonth(), day);
		const week = get_week_number(day_in_month);

		if (week in weeks) continue;
		weeks[week] = 0;
	}

	return weeks;
}

function is_income(transaction: Transaction) {
	return transaction.amount.startsWith('+');
}

function is_from_other_party(transaction: Transaction, ibans: (string | undefined)[]) {
	return !ibans.includes(transaction.iban_other_party || '');
}

function is_from_own_account(transaction: Transaction, ibans: (string | undefined)[]) {
	return !is_from_other_party(transaction, ibans);
}

function is_fixed(transaction: Transaction) {
	return !!transaction.authorization_code;
}
