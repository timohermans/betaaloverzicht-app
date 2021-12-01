import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';
import { isAuthenticated, popupOpen, user } from './store';

export type AuthUser = {
	name: string;
	email: string;
};

const config = {
	domain: 'betaaloverzicht.eu.auth0.com',
	clientId: '3OqvMx8KCbSj56U1O2x65zrlZoeSOCzF'
};

async function createClient(): Promise<Auth0Client> {
	const auth0Client = await createAuth0Client({
		domain: config.domain,
		client_id: config.clientId,
		cacheLocation: 'localstorage',
		useRefreshTokens: true
	});

	return auth0Client;
}

async function loginWithPopup(client: Auth0Client): Promise<void> {
	popupOpen.set(true);

	try {
		await client.loginWithPopup();

		user.set(await client.getUser());
		isAuthenticated.set(true);
	} catch (e) {
		console.error(e);
	} finally {
		popupOpen.set(false);
	}
}

function logout(client: Auth0Client): void | Promise<void> {
	return client.logout();
}

async function getApiToken(client: Auth0Client) {
	return await client.getTokenSilently({
		audience: 'http://localhost:2222'
	});
}

async function getAuthFetchConfig(client: Auth0Client): Promise<{
	// todo: refactor
	headers: { Authorization: string; 'Content-Type': string };
}> {
	const token = await getApiToken(client);

	return {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	};
}

const auth = {
	createClient,
	loginWithPopup,
	logout,
	getAuthFetchConfig
};

export default auth;
