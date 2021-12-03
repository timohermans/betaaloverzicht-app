import '@testing-library/jest-dom';
import setupFakeApi from './test-server';

jest.mock('@auth0/auth0-spa-js', () => ({
	__esModule: true,
	default: () => ({
		getTokenSilently: () => 'silent-token'
	})
}));