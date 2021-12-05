import '@testing-library/jest-dom';
import 'isomorphic-fetch';

jest.mock('@auth0/auth0-spa-js', () => ({
	__esModule: true,
	default: () => ({
		getTokenSilently: () => 'silent-token',
		getTokenWithPopup: () => 'secret-token'
	})
}));
