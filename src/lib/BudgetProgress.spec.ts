import BudgetProgress from '$lib/BudgetProgress.svelte';
import { screen } from '@testing-library/svelte';
import { budgetFactory, categoryFactory } from '$lib/utils/factories';
import { renderWithPropsAndState } from '$lib/utils/testUtils';
import type { CategorySummary } from './types';

const getProgress = () => screen.getByRole('progressbar') as HTMLProgressElement;

describe('BudgetProgress', () => {
	it('renders a progress bar with 0 value when there is no budget', () => {
		const summary: CategorySummary = {
			amount: 30,
			category: categoryFactory.build(),
			transactions: {}
		};

		renderWithPropsAndState(BudgetProgress, { summary }, { budgets: [] });

		expect(getProgress().value).toBe(0);
	});

	it('renders a progress bar with 50 value when expenses are half way of the budget', () => {
		const categorySummary: CategorySummary = {
			amount: 10,
			category: categoryFactory.build({ id: 1 }),
			transactions: {}
		};
		const budget = budgetFactory.build({ category_id: 1, amount: 20 });

		renderWithPropsAndState(BudgetProgress, { summary: categorySummary }, { budgets: [budget] });

		expect(getProgress().value).toBe(50);
	});
});
