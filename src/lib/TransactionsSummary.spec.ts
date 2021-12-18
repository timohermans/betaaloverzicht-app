import { render, screen } from '@testing-library/svelte';
import TransactionSummary from './TransactionsSummary.svelte';
import { transactionFactory } from "./utils/factories";

describe('TransactionSummary', () => {
	it('shows the incomes and expenses of this month', () => {
		const incomes = transactionFactory.buildList(6, {
			amount: '+10'
		});
		const expenses = transactionFactory.buildList(6, {
			amount: '-40'
		});

		render(TransactionSummary, { transactions: [...incomes, ...expenses] });

		expect(screen.getByText('Totaal binnengekomen')).toBeInTheDocument();
		expect(screen.getByText('60.00')).toBeInTheDocument();
		expect(screen.getByText('Totaal uitgegeven')).toBeInTheDocument();
		expect(screen.getByText('-240.00')).toBeInTheDocument();
	});
});
