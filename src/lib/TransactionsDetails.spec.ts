import TransactionsDetails from './TransactionsDetails.svelte';
import { render, screen, within } from '@testing-library/svelte';
import createFakeApi, { FakeServer } from '../../test-server';
import { toShortDate } from './utils/dates';

describe('TransactionsDetails', () => {
	let server: FakeServer;

	beforeEach(() => {
		server = createFakeApi();
	});

	afterEach(() => {
		server.shutdown();
	});

	it('shows expenses per category', () => {
		const boodschappen = server.create('category', { name: 'Boodschappen' });
		const salaris = server.create('category', { name: 'Salaris' });
		const transactions = [
			...server.createList('transaction', 4, {
				amount: '-10,25',
				category: boodschappen,
				date_transaction: toShortDate(new Date())
			}),
			...server.createList('transaction', 4, {
				amount: '+20,25',
				category: salaris,
				date_transaction: toShortDate(new Date())
			})
		];

		render(TransactionsDetails, { transactions });

		expect(
			within(screen.getByText('Boodschappen').closest('li')).getByText('-41.00')
		).toBeInTheDocument();
		expect(
			within(screen.getByText('Salaris').closest('li')).getByText('81.00')
		).toBeInTheDocument();
	});

	it('shows expenses aggregated by transaction under a category', () => {
		const boodschappen = server.create('category', { name: 'Boodschappen' });
		const transactions = [
			...server.createList('transaction', 2, {
				amount: '+10,25',
				name_other_party: 'Henk',
				category: boodschappen,
				date_transaction: toShortDate(new Date())
			}),
			...server.createList('transaction', 2, {
				amount: '+10,25',
				name_other_party: 'Stef',
				category: boodschappen,
				date_transaction: toShortDate(new Date())
			})
		];

		render(TransactionsDetails, { transactions });

		const boodschappenCategory = screen.getByText('Boodschappen').closest('li');

		expect(within(boodschappenCategory).getByText('41.00')).toBeInTheDocument();
		expect(within(screen.getByText('Henk').parentElement).getByText('20.50')).toBeInTheDocument();
		expect(within(screen.getByText('Stef').parentElement).getByText('20.50')).toBeInTheDocument();
	});
});
