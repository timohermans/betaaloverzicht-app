
import TransactionsUpload from '$lib/TransactionsUpload.svelte';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithPropsAndState } from './utils/testUtils';
import { parse } from '$lib/transaction';
import { saveTransactions } from './api';
import { vi, type Mock } from 'vitest';

vi.mock('$lib/api');
vi.mock('$lib/transaction');

describe('TransactionsUpload', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('signals that a file has been successfully uploaded', async () => {
		(parse as Mock).mockReturnValue([]);
		(saveTransactions as Mock).mockReturnValue(Promise.resolve());
		const uploadedEvent = vi.fn();

		renderWithPropsAndState(
			TransactionsUpload,
			{
				onTransactionsUploaded: uploadedEvent
			},
			{}
		);

		userEvent.upload(
			screen.getByLabelText('Nieuwe transacties'),
			new File([''], 'test.csv', { type: 'text/csv' })
		);
		userEvent.click(screen.getByText('Voeg toe'));

		await screen.findByText('Transacties opgeslagen!');
		expect(uploadedEvent).toHaveBeenCalled();
	});
});
