import '@testing-library/jest-dom';
import Transactions from '$lib/Transactions.svelte';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Category, Transaction } from '$lib/types';
import { categoryFactory, transactionFactory } from '$lib/utils/factories';
import { assignCategoryTo, getAllTransactions, upsertCategory } from '$lib/api';
import { renderWithState } from '$lib/utils/testUtils';
import { afterEach, vi, describe, it, expect, type Mock, beforeEach } from 'vitest';

describe('TransactionsOverview', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	// TODO: (XS) Create a loading panel on the root component for loading transactions

	it('shows a specific transaction among a list', () => {
		const transactions = transactionFactory.buildList(3);
		const category = categoryFactory.build({ name: 'Timo' });

		const specific = transactionFactory.build({
			amount: '+20,10',
			iban: 'NL11RABO0101010100',
			date_transaction: '2021-12-01',
			name_other_party: 'ANWB B.V.',
			description: 'nieuwe wandelschoenen',
			category: category
		});

		renderWithState(Transactions, { transactions: [...transactions, specific] });

		expect(screen.getAllByRole('row').length).toBe(4);
		expect(screen.getByText('+20,10'));
		expect(screen.getByText('NL11RABO0101010100'));
		expect(screen.getByText('2021-12-01'));
		expect(screen.getByText('ANWB B.V.'));
		expect(screen.getByText('nieuwe wandelschoenen'));
		expect(screen.getByText('Timo'));
	});

	it('is possible to assign a category to a transaction', async () => {
		vi.mock('$lib/api', () => ({
			upsertCategory: vi.fn(),
			assignCategoryTo: vi.fn(),
			getAllTransactions: vi.fn()
		}));

		(upsertCategory as Mock).mockImplementation((name) => categoryFactory.build({ id: 44, name }));
		const transaction: Transaction = transactionFactory.build();

		renderWithState(Transactions, { transactions: [transaction] });

		await userEvent.click(await screen.findByRole('row'));
		const categoryInput = screen.getByLabelText('Categorie toevoegen');

		await userEvent.type(categoryInput, 'Timo{enter}');

		expect(screen.getByText('Timo')).toBeInTheDocument();
		expect(upsertCategory).toHaveBeenCalledWith('Timo');
		expect(assignCategoryTo).toHaveBeenCalledWith(transaction.id, 44);
	});

	describe('clicking on a transaction', () => {
		let formElement: HTMLElement;
		let transaction: Transaction;
		let vasteLastenCategory: Category;

		beforeEach(async () => {
			const c1 = categoryFactory.build({ name: 'Vervoer' });
			vasteLastenCategory = categoryFactory.build({ name: 'Vaste lasten' });
			const c3 = categoryFactory.build({ name: 'Boodschappen' });
			transaction = transactionFactory.build({
				description: 'AH betaalautomaat 13',
				category: c3
			});

			renderWithState(Transactions, {
				transactions: [transaction],
				categories: [c1, vasteLastenCategory, c3]
			});

			await userEvent.click(screen.getByText('AH betaalautomaat 13'));
			const formEl = screen.getByLabelText('Categorie toevoegen').closest('form');
			if (formEl) formElement = formEl;
		});

		describe('clicking the same transaction again', () => {
			beforeEach(async () => {
				await userEvent.click(screen.getByText('AH betaalautomaat 13'));
			});

			it('hides the category selection', () => {
				expect(screen.queryByLabelText('Categorie toevoegen')).not.toBeInTheDocument();
			});
		});

		describe('clicking a new category', () => {
			beforeEach(async () => {
				await userEvent.click(await within(formElement).findByText('Vaste lasten'));
			});

			it('shows the clicked category as assigned category', async () => {
				expect(screen.getByText('Vaste lasten')).toBeInTheDocument();
				expect(screen.queryByText('Boodschappen')).not.toBeInTheDocument();
			});

			it('does not have to create a new category', () => {
				expect(upsertCategory).not.toHaveBeenCalled();
			});

			it('changed the category on the server', () => {
				expect(assignCategoryTo).toHaveBeenCalledWith(transaction.id, vasteLastenCategory.id);
			});
		});

		it("sets the transaction's category to the text input", () => {
			const categoryInput = screen.getByLabelText('Categorie toevoegen') as HTMLInputElement;
			expect(categoryInput.value).toBe('Boodschappen');
		});

		it('shows a list already existing categories', () => {
			expect(within(formElement).getByText('Vervoer')).toBeInTheDocument();
			expect(within(formElement).getByText('Vaste lasten')).toBeInTheDocument();
		});

		it('does not show the already assigned category in the category list', () => {
			expect(within(formElement).getByText('Vervoer')).toBeInTheDocument();
			expect(within(formElement).queryByText('Boodschappen')).not.toBeInTheDocument();
		});
	});

	describe('having multiple transactions with similarities', () => {
		let vervoer: Category;
		let terugbetaling: Category;
		let albertHeijnT1: Transaction;
		let albertHeijnT2: Transaction;
		let albertHeijnT3: Transaction;

		beforeEach(async () => {
			vervoer = categoryFactory.build({ name: 'Vervoer' });
			terugbetaling = categoryFactory.build({ name: 'Terugbetaling' });
			albertHeijnT1 = transactionFactory.build({
				name_other_party: 'Albert Heijn',
				description: 'Betaling 1'
			});
			albertHeijnT2 = transactionFactory.build({ name_other_party: 'Albert Heijn' });
			albertHeijnT3 = transactionFactory.build({
				name_other_party: 'Albert Heijn',
				category: terugbetaling
			});
			const xenos = transactionFactory.build({ description: 'Xenos kados' });

			renderWithState(Transactions, {
				transactions: [albertHeijnT1, albertHeijnT2, albertHeijnT3, xenos],
				categories: [terugbetaling, vervoer]
			});
		});

		describe('Clicking on "zonder categorie" filter', () => {
			beforeEach(async () => {
				await userEvent.click(screen.getByLabelText('zonder categorie'));
			});

			it('Removes transactions that already have categories assigned to them', () => {
				expect(screen.queryByText('Terugbetaling')).not.toBeInTheDocument();
			});

			it('Shows the transactions that have no category assigned', () => {
				expect(screen.getAllByRole('row').length).toBe(3);
			});
		});

		describe('clicking on a transaction which occurs multiple times (other party)', () => {
			beforeEach(async () => {
				await userEvent.click(screen.getByText('Betaling 1'));
				screen.getByLabelText('Categorie toevoegen');
			});

			describe('assigning a new category', () => {
				let boodschappen: Category;

				beforeEach(async () => {
					(upsertCategory as Mock).mockImplementation(
						(name) => (boodschappen = categoryFactory.build({ name }))
					);
					await userEvent.type(screen.getByLabelText('Categorie toevoegen'), 'Boodschappen{enter}');
				});

				describe('clicking on the next transaction', () => {
					beforeEach(async () => {
						await userEvent.click(await screen.findByText('Xenos kados'));
					});

					it('shows the previously created category in the list of possibilities', () => {
						const form = screen.getByLabelText('Categorie toevoegen').closest('form');
						if (!form) fail('unable to find category button');
						expect(within(form).getByText('Boodschappen'));
					});
				});

				it('assigns the category to the transactions without categories', () => {
					expect(screen.getAllByText(boodschappen.name).length).toBe(2);
					expect(upsertCategory).toHaveBeenCalledWith(boodschappen.name);
					expect(assignCategoryTo).toHaveBeenCalledWith(albertHeijnT1.id, boodschappen.id);
					expect(assignCategoryTo).toHaveBeenCalledWith(albertHeijnT2.id, boodschappen.id);
				});

				it('keeps the previously assigned category for the other transaction', () => {
					expect(screen.getByText('Terugbetaling'));
					expect(assignCategoryTo).not.toHaveBeenCalledWith(albertHeijnT3.id, boodschappen.id);
				});
			});

			it('shows an option to apply to other transactions', () => {
				expect(screen.getByLabelText('en 1 andere(n)')).toBeInTheDocument();
			});

			it('checks the option to apply to other transactions by default', () => {
				expect((screen.getByLabelText('en 1 andere(n)') as HTMLInputElement).checked).toBeTruthy();
			});
		});

		describe('executing the "assign automatically" button', () => {
			beforeEach(async () => {
				(getAllTransactions as Mock).mockReturnValue([albertHeijnT1, albertHeijnT2, albertHeijnT3]);
				await userEvent.click(screen.getByText('Categorien toewijzen'));
			});

			it('assigns categories to all non-assigned transactions', () => {
				expect(screen.getAllByText('Terugbetaling').length).toBe(3);
				expect(assignCategoryTo).toHaveBeenCalledWith(albertHeijnT1.id, terugbetaling.id);
				expect(assignCategoryTo).toHaveBeenCalledWith(albertHeijnT2.id, terugbetaling.id);
			});
		});
	});
});
