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

const auth = {
	createClient,
	loginWithPopup,
	logout
};

export default auth;
