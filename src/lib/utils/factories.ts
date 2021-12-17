import faker from 'faker';
import {Factory} from 'fishery';
import type {Category, Transaction} from '../transaction';

export const transactionFactory = Factory.define<Transaction>(({sequence}) => {
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
        category: null
    };
});

export const categoryFactory = Factory.define<Category>(({sequence}) => ({
    id: sequence,
    name: faker.lorem.word()
}));

