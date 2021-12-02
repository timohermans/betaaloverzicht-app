import TransactionsOverview from './TransactionsOverview.svelte';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import createFakeApi, { FakeServer } from '../../test-server';

describe('TransactionsUpload', () => {
	let server: FakeServer;

	beforeEach(() => {
		server = createFakeApi();
	});

	afterEach(() => {
		server.shutdown();
	});

	it('displays a loading indicator before showing a list of transactiosn', async () => {
		server.createList('transaction', 3);
		render(TransactionsOverview);

		expect(screen.getByText('loading...'));
		expect(screen.queryAllByRole('listitem').length).toBe(0);

		await waitForElementToBeRemoved(() => screen.getByText('loading...'));

		expect(screen.getAllByRole('listitem').length).toBe(3);
	});

	it('shows a specific transaction among a list', async () => {
		server.createList('transaction', 3);
		server.create('transaction', {
			amount: '+20,10',
			iban: 'NL11RABO0101010100',
			date_transaction: '2021-12-01',
			name_other_party: 'ANWB B.V.',
			description: 'nieuwe wandelschoenen',
			category: { id: 1, name: 'Timo' }
		});

		render(TransactionsOverview);

		expect((await screen.findAllByRole('listitem')).length).toBe(4);
		expect(screen.getByText('+20,10'));
		expect(screen.getByText('NL11RABO0101010100'));
		expect(screen.getByText('2021-12-01'));
		expect(screen.getByText('ANWB B.V.'));
		expect(screen.getByText('nieuwe wandelschoenen'));
		expect(screen.getByText('Timo'));
	});

	it('runs the test framework', () => {
		const x = 10;

		expect(10).toBe(x);
	});
});
