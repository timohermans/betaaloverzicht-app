import { createServer, Factory, Model, Server, RestSerializer, Registry } from 'miragejs';
import type { Category, Transaction } from './src/lib/transaction';
import faker from 'faker';
import type { Assign, FactoryDefinition, ModelDefinition } from 'miragejs/-types';

const toSnakeCase = (str) =>
	str &&
	str
		.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
		.map((x) => x.toLowerCase())
		.join('_');

export type FakeServer = Server<
	Registry<
		{
			transaction: ModelDefinition<Partial<Transaction>>;
			category: ModelDefinition<Partial<Category>>;
		},
		{
			transaction: FactoryDefinition<Partial<Transaction>>;
			category: FactoryDefinition<Partial<Category>>;
		}
	>
>;

function createFakeApi(): FakeServer {
	return createServer({
		environment: 'test',
		serializers: {
			application: RestSerializer.extend({
				root: false,
				embed: true,
				keyForAttribute(attr) {
					return toSnakeCase(attr);
				}
			})
		},
		models: {
			transaction: Model.extend<Partial<Transaction>>({}),
			category: Model.extend<Partial<Category>>({})
		},
		factories: {
			transaction: Factory.extend<Partial<Transaction>>({
				amount: faker.finance.amount(1, 100, 2),
				follow_number: faker.datatype.number(10000).toString(),
				iban: faker.finance.iban(false, 'NL'),
				code() {
					return `${this.follow_number}${this.iban}`;
				},
				currency: 'EUR',
				date_transaction() {
					const date = faker.date.recent(31);
					return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
				},
				description: faker.lorem.words(5),
				name_other_party: `${faker.name.firstName()} ${faker.name.lastName()}`,
				iban_other_party: faker.finance.iban(false, 'NL')
			}),
			category: Factory.extend<Partial<Category>>({
				name: faker.lorem.word()
			})
		},
		routes() {
			this.get('http://localhost:2222/transactions', (schema, request) => {
				return schema.all('transaction');
			});
		}
	});
}

export default createFakeApi;
