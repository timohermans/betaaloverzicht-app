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

	const findParentByText = async (text: string, parentSelector: string) => {
		const element = await screen.findByText(text);
		const parent = element.closest(parentSelector);
		expect(parent).toBeTruthy(); // if parent is not found, the entire test suite will crash
		return parent as HTMLElement;
	};

	it('shows expenses per category', async () => {
		const boodschappen = server.create('category', { name: 'Boodschappen' });
		const salaris = server.create('category', { name: 'Salaris' });
		server.createList('transaction', 4, {
			amount: '-10,25',
			category: boodschappen,
			date_transaction: toShortDate(new Date())
		});
		server.createList('transaction', 4, {
			amount: '+20,25',
			category: salaris,
			date_transaction: toShortDate(new Date())
		});

		render(TransactionsDetails);

		expect(
			within(await findParentByText('Boodschappen', 'li')).getByText('-41.00')
		).toBeInTheDocument();
		expect(within(await findParentByText('Salaris', 'li')).getByText('81.00')).toBeInTheDocument();
	});
});
