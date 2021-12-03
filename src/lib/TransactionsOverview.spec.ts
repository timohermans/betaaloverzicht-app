import TransactionsOverview from './TransactionsOverview.svelte';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import createFakeApi, { FakeServer } from '../../test-server';
import userEvent from '@testing-library/user-event';

describe('TransactionsOverview', () => {
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
		const category = server.create('category', { name: 'Timo' });
		server.create('transaction', {
			amount: '+20,10',
			iban: 'NL11RABO0101010100',
			date_transaction: '2021-12-01',
			name_other_party: 'ANWB B.V.',
			description: 'nieuwe wandelschoenen',
			category: category
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

	it('is possible to assign a category to a transaction', async () => {
		server.create('transaction');
		render(TransactionsOverview);
		userEvent.click(await screen.findByRole('listitem'));
		const categoryInput = await screen.findByLabelText('Categorie toevoegen');

		userEvent.type(categoryInput, 'Timo{enter}');

		await waitForElementToBeRemoved(categoryInput);
		expect(await screen.findByText('Timo')).toBeInTheDocument();
	});

	it('sets the existing category in the input when editing', async () => {
		server.create('transaction', {
			category: server.create('category', { name: 'Boodschappen' })
		});
		render(TransactionsOverview);

		userEvent.click(await screen.findByRole('listitem'));

		const categoryInput = await screen.findByLabelText('Categorie toevoegen') as HTMLInputElement;
		expect(categoryInput.value).toBe('Boodschappen');
	});
});
