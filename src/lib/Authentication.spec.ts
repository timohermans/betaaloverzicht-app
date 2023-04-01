import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import { login_with } from './auth';
import Authentication from './Authentication.svelte';
import { translationMap } from './translations';
import { renderWithState } from './utils/testUtils';

const username = 'timo';

vi.mock('$lib/auth', () => ({
	login_with: vi.fn(),
	pb: {
		authStore: {
			model: {},
			onChange: vi.fn()
		}
	}
}));

describe('<Authentication />', () => {
	afterEach(() => vi.clearAllMocks());

	it('logs the user in after incorrectly logging in', async () => {
		(login_with as Mock).mockResolvedValueOnce(false);
		renderWithState(Authentication);
		const usernameEl = () => screen.getByLabelText(translationMap.nl.login_username_label);
		const passwordEl = () => screen.getByLabelText(translationMap.nl.login_password_label);

		// incorrect attempt
		await userEvent.type(usernameEl(), username);
		await userEvent.type(passwordEl(), 'wrong password{enter}');

		expect(screen.getByText(translationMap.nl.login_incorrect_message)).toBeInTheDocument();

		// correct attempt
		(login_with as Mock).mockClear();
		(login_with as Mock).mockResolvedValueOnce(true);
		await userEvent.clear(usernameEl());
		await userEvent.clear(passwordEl());
		await userEvent.type(usernameEl(), username);
		await userEvent.type(passwordEl(), 'secret password{enter}');

		expect(login_with as Mock).toHaveBeenCalledWith(username, 'secret password');
		expect(screen.getByText(username)).toBeInTheDocument();
		expect(screen.queryByLabelText(translationMap.nl.login_username_label)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(translationMap.nl.login_password_label)).not.toBeInTheDocument();
		expect(screen.queryByText(translationMap.nl.login_incorrect_message)).not.toBeInTheDocument();
	});

	it('shows no errors and username initially', () => {
		const { queryByText } = renderWithState(Authentication);
		expect(queryByText(username)).not.toBeInTheDocument();
		expect(queryByText(translationMap.nl.login_incorrect_message)).not.toBeInTheDocument();
	});
});
