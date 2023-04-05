import faker from 'faker';
import { Factory } from 'fishery';
import type { Budget, Category, Transaction } from '$lib/types';

export const transactionFactory = Factory.define<Transaction>(({ sequence }) => {
	const follow_number = faker.datatype.number(10000).toString();
	const iban = faker.finance.iban(false, 'NL');
	const date = faker.date.recent(31);

	return {
		id: sequence,
		amount: faker.finance.amount(1, 100, 2),
		amount_after_transaction: faker.datatype.number(100000).toString(),
		follow_number,
		iban,
		code: `${follow_number}${iban}`,
		currency: 'EUR',
		date_transaction: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
		description: faker.lorem.words(5),
		name_other_party: `${faker.name.firstName()} ${faker.name.lastName()}`,
		iban_other_party: faker.finance.iban(false, 'NL'),
		category: undefined
	};
});

export const categoryFactory = Factory.define<Category>(({ sequence }) => ({
	id: sequence,
	name: faker.lorem.word()
}));

export const budgetFactory = Factory.define<Budget>(({ sequence }) => ({
	id: sequence,
	amount: +faker.finance.amount(0, 500, 2),
	category_id: faker.datatype.number(),
	month: faker.datatype.number({ min: 0, max: 11 }),
	user_id: faker.datatype.number(),
	year: faker.datatype.number({ min: 2010, max: 2050 })
}));
