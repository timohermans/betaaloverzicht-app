import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';
import { isAuthenticated, popupOpen, user } from './store';
import { variables } from '$lib/variables';

export type AuthUser = {
	name?: string;
	email?: string;
};

async function createClient(): Promise<Auth0Client> {
	const auth0Client = await createAuth0Client({
		domain: variables.auth0Domain,
		client_id: variables.auth0ClientId,
		cacheLocation: 'localstorage',
		useRefreshTokens: true
	});

	return auth0Client;
}

async function loginWithPopup(client: Auth0Client): Promise<void> {
	popupOpen.set(true);

	try {
		await client.loginWithPopup();
		const clientUser = await client.getUser();

		if (clientUser) {
			user.set(clientUser);
			isAuthenticated.set(true);
		}
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
