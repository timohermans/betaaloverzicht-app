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

function parse(file: File): Promise<Transaction[]> {
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

function convertAmount(amount: string, isInverted: boolean): number {
	return tryInvert(toNumber(amount), isInverted);
}
const toNumber = (amount: string) => +amount.replace(',', '.');
const tryInvert = (amount: number, isInverted: boolean): number =>
	isInverted ? amount * -1 : amount;

export { parse, convertAmount };
