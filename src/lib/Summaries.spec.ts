import '@testing-library/jest-dom';
import Summaries from './Summaries.svelte';
import { screen, within } from '@testing-library/svelte';
import { toShortDate } from '$lib/utils/dates';
import { categoryFactory, transactionFactory } from '$lib/utils/factories';
import { renderWithState } from '$lib/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { ignoreCategoryInTotalsBy } from '$lib/api';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

const parentTag = '.summary';

describe('Summaries', () => {
	beforeEach(() => {
		vi.mock('$lib/api', () => ({
			ignoreCategoryInTotalsBy: vi.fn(),
			upsertBudget: vi.fn()
		}));
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('shows summaries for categories even when there are no transactions', () => {
		const boodschappen = categoryFactory.build({ name: 'Boodschappen' });
		const salaris = categoryFactory.build({ name: 'Salaris' });

		renderWithState(Summaries, { transactions: [], categories: [boodschappen, salaris] });

		expect(screen.getByText('Boodschappen')).toBeInTheDocument();
		expect(screen.getByText('Salaris')).toBeInTheDocument();
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
			within(screen.getByText('Boodschappen').closest(parentTag)).getByText('41.00')
		).toBeInTheDocument();
		expect(
			within(screen.getByText('Salaris').closest(parentTag)).getByText('81.00')
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

		it('has the possibility to set the amount to ignored (which now just shows the amount)', async () => {
			const ignoreButton = screen.getByText('🙈');

			await userEvent.click(ignoreButton);

			expect(ignoreCategoryInTotalsBy).toHaveBeenCalledWith(boodschappen.id, true);
			expect(await screen.findByText('41.00')).toBeInTheDocument();
		});

		it('shows expenses aggregated by transaction under a category', async () => {
			const boodschappenCategory = screen
				.getByText('Boodschappen')
				.closest(parentTag) as HTMLElement;

			await userEvent.click(within(boodschappenCategory).getByText('🕵🏻‍♂️'));

			expect(await within(boodschappenCategory).findByText('41.00')).toBeInTheDocument();
			expect(within(screen.getByText('Henk').parentElement).getByText('20.50')).toBeInTheDocument();
			expect(within(screen.getByText('Stef').parentElement).getByText('20.50')).toBeInTheDocument();
		});
	});
});
