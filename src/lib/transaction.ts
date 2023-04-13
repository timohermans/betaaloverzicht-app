import * as Papa from 'papaparse';
import type { Transaction } from './types';

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

function parse(file: string): Promise<Transaction[]> {
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

const to_number = (amount: string) => +amount.replace(',', '.');

interface TransactionsByWeek {
	[week: string]: Transaction[];
}

function splitTransactionsByWeek(transactions: Transaction[]): TransactionsByWeek {
	const sortedTransactions = transactions.sort((a, b) => {
		return Date.parse(a.date_transaction) - Date.parse(b.date_transaction);
	});

	const weeks: TransactionsByWeek = {};
	sortedTransactions.forEach((transaction) => {
		const transactionDate = new Date(transaction.date_transaction);
		const weekNumber = getWeekNumber(transactionDate);
		const weekKey = `Week ${weekNumber}, ${transactionDate.getFullYear()}`;

		if (!weeks[weekKey]) {
			weeks[weekKey] = [];
		}

		weeks[weekKey].push(transaction);
	});

	return weeks;
}

function getWeekNumber(date: Date): number {
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

export { parse, to_number, splitTransactionsByWeek };
