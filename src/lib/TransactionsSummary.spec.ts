import { render, screen } from '@testing-library/svelte';
import createFakeApi, { FakeServer } from '../../test-server';
import TransactionSummary from './TransactionsSummary.svelte';

describe('TransactionSummary', () => {
	let server: FakeServer;

	beforeEach(() => {
		server = createFakeApi();
	});

	afterEach(() => {
		server.shutdown();
	});

	it('shows the incomes and expenses of this month', () => {
		const incomes = server.createList('transaction', 6, {
			amount: '+10'
		});
		const expenses = server.createList('transaction', 6, {
			amount: '-40'
		});

		render(TransactionSummary, { transactions: [...incomes, ...expenses] });

		expect(screen.getByText('Totaal binnengekomen')).toBeInTheDocument();
		expect(screen.getByText('60.00')).toBeInTheDocument();
		expect(screen.getByText('Totaal uitgegeven')).toBeInTheDocument();
		expect(screen.getByText('-240.00')).toBeInTheDocument();
	});
});
