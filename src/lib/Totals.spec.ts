import { screen } from '@testing-library/svelte';
import Totals from '$lib/Totals.svelte';
import { categoryFactory, transactionFactory } from '$lib/utils/factories';
import { renderWithState } from '$lib/utils/testUtils';

describe('TransactionSummary', () => {
	it('shows the incomes and expenses of this month', () => {
		const incomes = transactionFactory.buildList(6, {
			amount: '+10'
		});
		const expenses = transactionFactory.buildList(6, {
			amount: '-40'
		});
		const invertedTransaction = transactionFactory.build({
			amount: '-40.00',
			category: categoryFactory.build({ is_ignored_in_totals: true })
		});

		renderWithState(Totals, { transactions: [...incomes, ...expenses, invertedTransaction] });

		expect(screen.getByText('Totaal binnengekomen')).toBeInTheDocument();
		expect(screen.getByText('60.00')).toBeInTheDocument();
		expect(screen.getByText('Totaal uitgegeven')).toBeInTheDocument();
		expect(screen.getByText('-240.00')).toBeInTheDocument();
		expect(screen.getByText('Totaal balans')).toBeInTheDocument();
		expect(screen.getByText('-180.00')).toBeInTheDocument();
	});
});
