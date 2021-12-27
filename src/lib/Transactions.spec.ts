import Transactions from '$lib/Transactions.svelte';
import { screen, waitForElementToBeRemoved, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Category, Transaction } from '$lib/types';
import { categoryFactory, transactionFactory } from '$lib/utils/factories';
import { assignCategoryTo, getAllTransactions, upsertCategory } from '$lib/api';
import { renderWithState } from '$lib/utils/testUtils';

jest.mock('./api');

describe('TransactionsOverview', () => {
	beforeEach(() => {
		jest.resetAllMocks();
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

		expect(screen.getAllByRole('listitem').length).toBe(4);
		expect(screen.getByText('+20,10'));
		expect(screen.getByText('NL11RABO0101010100'));
		expect(screen.getByText('2021-12-01'));
		expect(screen.getByText('ANWB B.V.'));
		expect(screen.getByText('nieuwe wandelschoenen'));
		expect(screen.getByText('Timo'));
	});

	it('is possible to assign a category to a transaction', async () => {
		let createdCategory: Category;
		(upsertCategory as jest.Mock).mockImplementation(
			(name) => (createdCategory = categoryFactory.build({ name }))
		);
		const transaction: Transaction = transactionFactory.build();

		renderWithState(Transactions, { transactions: [transaction] });

		userEvent.click(await screen.findByRole('listitem'));
		const categoryInput = await screen.findByLabelText('Categorie toevoegen');

		userEvent.type(categoryInput, 'Timo{enter}');

		await waitForElementToBeRemoved(categoryInput);

		expect(await screen.findByText('Timo')).toBeInTheDocument();
		expect(upsertCategory).toHaveBeenCalledWith('Timo');
		expect(assignCategoryTo).toHaveBeenCalledWith(transaction.id, createdCategory.id);
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

			userEvent.click(screen.getByText('AH betaalautomaat 13'));
			formElement = (await screen.findByLabelText('Categorie toevoegen')).closest('form');
		});

		describe('clicking the same transaction again', () => {
			beforeEach(() => {
				userEvent.click(screen.getByText('AH betaalautomaat 13'));
			});

			it('hides the category selection', () => {
				expect(screen.queryByLabelText('Categorie toevoegen')).not.toBeInTheDocument();
			});
		});

		describe('clicking a new category', () => {
			beforeEach(async () => {
				userEvent.click(await within(formElement).findByText('Vaste lasten'));
				await waitForElementToBeRemoved(() => screen.queryByLabelText('Categorie toevoegen'));
			});

			it('shows the clicked category as assigned category', async () => {
				expect(await screen.findByText('Vaste lasten')).toBeInTheDocument();
				expect(screen.queryByText('Boodschappen')).not.toBeInTheDocument();
			});

			it('does not have to create a new category', () => {
				expect(upsertCategory).not.toHaveBeenCalled();
			});

			it('changed the category on the server', () => {
				expect(assignCategoryTo).toHaveBeenCalledWith(transaction.id, vasteLastenCategory.id);
			});
		});

		it("sets the transaction's category to the text input", async () => {
			const categoryInput = (await screen.findByLabelText(
				'Categorie toevoegen'
			)) as HTMLInputElement;
			expect(categoryInput.value).toBe('Boodschappen');
		});

		it('shows a list already existing categories', async () => {
			expect(await within(formElement).findByText('Vervoer')).toBeInTheDocument();
			expect(within(formElement).getByText('Vaste lasten')).toBeInTheDocument();
		});

		it('does not show the already assigned category in the category list', async () => {
			expect(await within(formElement).findByText('Vervoer')).toBeInTheDocument();
			expect(within(formElement).queryByText('Boodschappen')).not.toBeInTheDocument();
		});
	});

	describe('having multiple transactions with similarities', () => {
		let vervoer;
		let terugbetaling;
		let albertHeijnT1;
		let albertHeijnT2;
		let albertHeijnT3;

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

			await screen.findByText('Betaling 1');
		});

		describe('clicking on a transaction which occurs multiple times (other party)', () => {
			beforeEach(async () => {
				userEvent.click(screen.getByText('Betaling 1'));
				await screen.findByLabelText('Categorie toevoegen');
			});

			describe('assigning a new category', () => {
				let boodschappen: Category;

				beforeEach(async () => {
					(upsertCategory as jest.Mock).mockImplementation(
						(name) => (boodschappen = categoryFactory.build({ name }))
					);
					userEvent.type(screen.getByLabelText('Categorie toevoegen'), 'Boodschappen{enter}');
					await waitForElementToBeRemoved(() => screen.getByLabelText('Categorie toevoegen'));
				});

				describe('clicking on the next transaction', () => {
					beforeEach(async () => {
						userEvent.click(await screen.findByText('Xenos kados'));
						await screen.findByLabelText('Categorie toevoegen');
					});

					it('shows the previously created category in the list of possibilities', () => {
						expect(
							within(screen.getByLabelText('Categorie toevoegen').closest('form')).getByText(
								'Boodschappen'
							)
						);
					});
				});

				it('assigns the category to the transactions without categories', async () => {
					expect((await screen.findAllByText(boodschappen.name)).length).toBe(2);
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
			beforeEach(() => {
				(getAllTransactions as jest.Mock).mockReturnValue([
					albertHeijnT1,
					albertHeijnT2,
					albertHeijnT3
				]);
				userEvent.click(screen.getByText('Categorien toewijzen'));
			});

			it('assigns categories to all non-assigned transactions', async () => {
				expect((await screen.findAllByText('Terugbetaling')).length).toBe(3);
				expect(assignCategoryTo).toHaveBeenCalledWith(albertHeijnT1.id, terugbetaling.id);
				expect(assignCategoryTo).toHaveBeenCalledWith(albertHeijnT2.id, terugbetaling.id);
			});
		});
	});
});
