import {
	createServer,
	Factory,
	Model,
	Server,
	RestSerializer,
	Registry,
	belongsTo
} from 'miragejs';
import type { Category, Transaction } from './src/lib/transaction';
import faker from 'faker';
import type { BelongsTo, FactoryDefinition, ModelDefinition } from 'miragejs/-types';
import type { SerializerInterface } from 'miragejs/serializer';

const toSnakeCase = (str) =>
	str &&
	str
		.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
		.map((x) => x.toLowerCase())
		.join('_');

type TransactionModel = Pick<Transaction, Exclude<keyof Transaction, 'category'>> & {
	category: BelongsTo<string>;
};

export type FakeServer = Server<
	Registry<
		{
			transaction: ModelDefinition<TransactionModel>;
			category: ModelDefinition<Partial<Category>>;
		},
		{
			transaction: FactoryDefinition<TransactionModel>;
			category: FactoryDefinition<Partial<Category>>;
		}
	>
>;

const CustomSerializer: SerializerInterface = RestSerializer.extend({
	root: false,
	embed: true,
	keyForAttribute(attr) {
		return toSnakeCase(attr);
	}
});

function createFakeApi(): FakeServer {
	return createServer({
		environment: 'test',
		serializers: {
			application: CustomSerializer,
			transaction: CustomSerializer.extend({
				include: ['category']
			})
		},
		models: {
			transaction: Model.extend<Partial<TransactionModel>>({
				category: belongsTo()
			}),
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
			this.urlPrefix = 'http://localhost:2222';

			this.get('/transactions', (schema) => {
				return schema.all('transaction');
			});

			this.patch('/transactions', (schema, request) => {
				const id = request.queryParams.id.split('.')[1];
				const body = JSON.parse(request.requestBody);

				const transaction = schema.find('transaction', id);
				if (body.category_id) {
					const category = schema.find('category', body.category_id);

					transaction.update({
						category: category
					});
				}

				return transaction;
			});

			this.post('/categories', (schema, request) => {
				return schema.create('category', JSON.parse(request.requestBody));
			});
		}
	});
}

export default createFakeApi;
