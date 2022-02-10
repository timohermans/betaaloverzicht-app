import { renderWithState } from './utils/testUtils';
import { transactionFactory } from './utils/factories';
import Accounts from './Accounts.svelte';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

describe('Accounts', () => {
	describe('having multiple transactions with two different receivers', () => {
		let options;

		beforeEach(async () => {
			const transactions = [
				transactionFactory.build({ iban: 'NL22RABO0101010111', description: 'stage 2.1' }),
				transactionFactory.build({ iban: 'NL22RABO0101010111', description: 'stage 2.2' }),
				transactionFactory.build({ iban: 'NL22RABO0202020222' }),
				transactionFactory.build({ iban: 'NL22RABO0202020222' }),
				transactionFactory.build({ iban: 'NL22RABO0202020222' })
			];
			renderWithState(Accounts, { transactions }, true);
			options = await screen.findAllByRole('option');
		});

		describe('selecting the other iban', () => {
			beforeEach(() => {
				userEvent.selectOptions(screen.getByRole('combobox'), 'NL22RABO0101010111');
			});

			it('shows the other transactions', async () => {
				expect(
					within(screen.getByTestId('state-transactions')).getAllByRole('listitem').length
				).toBe(2);
			});
		});

		it('shows two iban options to select', () => {
			expect(options.length).toBe(2);
		});

		it('sorts the ibans by transaction frequency', () => {
			expect(options[0].textContent).toBe('NL22RABO0202020222');
			expect(options[1].textContent).toBe('NL22RABO0101010111');
		});

		it('displays only transactions of the chosen iban', () => {
			expect(within(screen.getByTestId('state-transactions')).getAllByRole('listitem').length).toBe(
				3
			);
		});
	});
});
