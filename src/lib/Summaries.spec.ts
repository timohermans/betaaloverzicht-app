import Summaries from './Summaries.svelte';
import { screen, within } from '@testing-library/svelte';
import { toShortDate } from '$lib/utils/dates';
import { categoryFactory, transactionFactory } from '$lib/utils/factories';
import { renderWithState } from '$lib/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { invertCategoryBy } from '$lib/api';

jest.mock('$lib/api');

describe('Summaries', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('shows expenses per category', () => {
		const boodschappen = categoryFactory.build({ name: 'Boodschappen' });
		const salaris = categoryFactory.build({ name: 'Salaris' });
		const transactions = [
			...transactionFactory.buildList(4, {
				amount: '-10,25',
				category: boodschappen,
				date_transaction: toShortDate(new Date())
			}),
			...transactionFactory.buildList(4, {
				amount: '+20,25',
				category: salaris,
				date_transaction: toShortDate(new Date())
			})
		];

		renderWithState(Summaries, { transactions });

		expect(
			within(screen.getByText('Boodschappen').closest('li')).getByText('-41.00')
		).toBeInTheDocument();
		expect(
			within(screen.getByText('Salaris').closest('li')).getByText('81.00')
		).toBeInTheDocument();
	});

	describe('having one category with + 41.00', () => {
		let boodschappen;
		beforeEach(() => {
			boodschappen = categoryFactory.build({ name: 'Boodschappen' });
			const transactions = [
				...transactionFactory.buildList(2, {
					amount: '+10,25',
					name_other_party: 'Henk',
					category: boodschappen,
					date_transaction: toShortDate(new Date())
				}),
				...transactionFactory.buildList(2, {
					amount: '+10,25',
					name_other_party: 'Stef',
					category: boodschappen,
					date_transaction: toShortDate(new Date())
				})
			];

			renderWithState(Summaries, { transactions });
		});

		it('has the possibility to invert the amount', async () => {
			const invertButton = screen.getByText('-1');

			userEvent.click(invertButton);

			expect(invertCategoryBy).toHaveBeenCalledWith(boodschappen.id, true);
			expect(await screen.findByText('-41.00')).toBeInTheDocument();
			expect(invertButton.className).toContain('active');
		});

		it('shows expenses aggregated by transaction under a category', () => {
			const boodschappenCategory = screen.getByText('Boodschappen').closest('li');

			expect(within(boodschappenCategory).getByText('41.00')).toBeInTheDocument();
			expect(within(screen.getByText('Henk').parentElement).getByText('20.50')).toBeInTheDocument();
			expect(within(screen.getByText('Stef').parentElement).getByText('20.50')).toBeInTheDocument();
		});
	});
});
