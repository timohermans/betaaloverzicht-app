import { afterAll, beforeAll, vi } from 'vitest';
import { fetch } from 'cross-fetch';

// Add `fetch` polyfill.
global.fetch = fetch;
window.HTMLCanvasElement.prototype.getContext = () => null;

beforeAll(() => {
	vi.mock('$lib/variables', () => ({
		__esModule: true,
		variables: {
			apiUrl: 'http://localhost:2222'
		}
	}));

	vi.mock('@auth0/auth0-spa-js', () => ({
		__esModule: true,
		default: () => ({
			getTokenSilently: () => 'silent-token',
			getTokenWithPopup: () => 'secret-token'
		})
	}));

	vi.mock('chart.js/auto', () => {
		return {
			default: vi.fn().mockImplementation(() => {
				return {
					constructor: vi.fn(),
					destroy: vi.fn()
				};
			})
		};
	});
});

afterAll(() => {
	vi.resetAllMocks();
});
