import TransactionsUpload from '$lib/TransactionsUpload.svelte';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithPropsAndState } from './utils/testUtils';
import { parse } from '$lib/transaction';
import { saveTransactions } from './api';

jest.mock('$lib/api');
jest.mock('$lib/transaction');

describe('TransactionsUpload', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('signals that a file has been successfully uploaded', async () => {
		(parse as jest.Mock).mockReturnValue([]);
		(saveTransactions as jest.Mock).mockReturnValue(Promise.resolve());
		const uploadedEvent = jest.fn();

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
