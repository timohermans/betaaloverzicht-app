import '@testing-library/jest-dom';
import 'isomorphic-fetch';

jest.mock('$lib/variables', () => ({
	__esModule: true,
	variables: {
		apiUrl: 'http://localhost:2222'
	}
}));

jest.mock('@auth0/auth0-spa-js', () => ({
	__esModule: true,
	default: () => ({
		getTokenSilently: () => 'silent-token',
		getTokenWithPopup: () => 'secret-token'
	})
}));

jest.mock('chart.js/auto/auto.esm', () => {
	return {
		default: jest.fn().mockImplementation(() => {
			return {
				constructor: jest.fn(),
				destroy: jest.fn()
			};
		})
	};
});
