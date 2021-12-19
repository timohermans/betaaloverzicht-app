import Budget from '$lib/Budget.svelte';
import { screen } from '@testing-library/svelte';
import { renderWithPropsAndState } from '$lib/utils/testUtils';
import { categoryFactory } from './utils/factories';
import userEvent from '@testing-library/user-event';

describe('Budget', () => {
	describe('having no budget set for Boodschappen', () => {
		beforeEach(() => {
			const boodschappenCategory = categoryFactory.build({ id: 1, name: 'Boodschappen' });

			renderWithPropsAndState(Budget, { category: boodschappenCategory }, {});
		});

		describe('clicking on the 0', () => {
			let input;
			beforeEach(() => {
				input = screen.getByText('0');
				userEvent.click(input);
			});

			describe('entering a new budget', () => {
				beforeEach(() => {
					userEvent.type(input, '250{enter}');
				});

				it('shows a loading indicator', () => {
					fail('not implemented yet');
				});

				it('called the api to upsert the budget', () => {
					fail('not implemented yet');
				});

				it('hides the loading indicator afterwards', () => {
					fail('not implemented yet');
				});

				it('shows the updated text', () => {
					fail('not implemented yet');
				});
			});

			it('shows a text input to set a budget', () => {
				const input = screen.getByPlaceholderText('Wat is je budget?');
				expect(input).toBeInTheDocument();
				expect(input).toHaveAttribute('type', 'number');
			});

			it('hides the 0', () => {
				fail('not implemented yet');
			});
		});

		it('renders 0 when there is no budget', () => {
			expect(screen.getByText('0')).toBeInTheDocument();
		});

		it('does not initially render a text input', () => {
			expect(screen.queryByPlaceholderText('Wat is je budget?')).not.toBeInTheDocument();
		});
	});
});
