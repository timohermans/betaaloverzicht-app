import Budget from '$lib/Budget.svelte';
import { screen } from '@testing-library/svelte';
import { renderWithPropsAndState } from '$lib/utils/testUtils';
import { budgetFactory, categoryFactory } from '$lib/utils/factories';
import userEvent from '@testing-library/user-event';
import { upsertBudget } from '$lib/api';
import type { Budget as BudgetType, CategorySummary } from '$lib/types';

jest.mock('$lib/api');

describe('Budget', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('having no budget set for Boodschappen', () => {
		beforeEach(() => {
			const boodschappenCategory: CategorySummary = {
				category: categoryFactory.build({ id: 1, name: 'Boodschappen' }),
				amount: 10,
				transactions: {}
			};

			renderWithPropsAndState(
				Budget,
				{ summary: boodschappenCategory },
				{ date: new Date(2021, 0, 1) }
			);
		});

		describe('clicking budget progress text', () => {
			beforeEach(() => {
				userEvent.click(screen.getByText('10.00'));
			});

			describe('entering a new budget', () => {
				beforeEach(() => {
					(upsertBudget as jest.Mock).mockReturnValue(
						budgetFactory.build({ category_id: 1, amount: 250, year: 2021, month: 1 })
					);
					userEvent.type(screen.getByPlaceholderText('Wat is je budget?'), '250{enter}');
				});

				it('called the api to upsert the budget', () => {
					expect(upsertBudget).toHaveBeenCalledWith(1, 250, new Date(2021, 0, 1));
				});

				it('shows the updated text', () => {
					expect(screen.getByText('250')).toBeInTheDocument();
				});

				it('hides the input', () => {
					expect(screen.queryByPlaceholderText('Wat is je budget?')).not.toBeInTheDocument();
				});
			});

			it('shows a text input to set a budget', () => {
				const input = screen.getByPlaceholderText('Wat is je budget?');
				expect(input).toBeInTheDocument();
				expect(input).toHaveAttribute('type', 'number');
			});

			it('hides the 0', () => {
				expect(screen.queryByText('0')).not.toBeInTheDocument();
			});
		});

		it('renders only the amount received', () => {
			expect(screen.getByText('10.00')).toBeInTheDocument();
		});

		it('does not initially render a text input', () => {
			expect(screen.queryByPlaceholderText('Wat is je budget?')).not.toBeInTheDocument();
		});
	});

	describe('having a previously set budget', () => {
		let boodschappen: CategorySummary;
		let budget: BudgetType;

		beforeEach(() => {
			boodschappen = {
				category: categoryFactory.build({ id: 1, name: 'Boodschappen' }),
				amount: 10,
				transactions: {}
			};
			budget = budgetFactory.build({
				category_id: boodschappen.category.id,
				amount: 250,
				month: 1,
				year: 2021
			});
			renderWithPropsAndState(
				Budget,
				{ summary: boodschappen },
				{ budgets: [budget], date: new Date(2021, 0, 16) }
			);
		});

		describe('clicking on the budget', () => {
			let input: HTMLInputElement;
			beforeEach(async () => {
				userEvent.click(screen.getByText('250'));
				input = (await screen.findByPlaceholderText('Wat is je budget?')) as HTMLInputElement;
			});

			describe('setting a new value', () => {
				beforeEach(() => {
					(upsertBudget as jest.Mock).mockReturnValue({ ...budget, amount: 500 });
					userEvent.clear(input);
					userEvent.type(input, '500{enter}');
				});

				it('calls the api', () => {
					expect(upsertBudget).toHaveBeenCalledWith(
						boodschappen.category.id,
						500,
						new Date(2021, 0, 1)
					);
				});

				it('shows the updated value in text', () => {
					expect(screen.getByText('500')).toBeInTheDocument();
				});

				it('does not show the old value anymore', () => {
					expect(screen.queryByText('250')).not.toBeInTheDocument();
				});
			});

			it('shows the budget in the input', () => {
				expect(input.value).toBe('250');
			});
		});

		it('shows the previously set budget', () => {
			expect(screen.getByText('250')).toBeInTheDocument();
		});
	});
});
