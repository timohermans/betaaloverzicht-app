<script lang="ts">
	import { onMount } from 'svelte';
	import auth from './auth';
	import { isAuthenticated, user } from './store';
	import type { Auth0Client } from '@auth0/auth0-spa-js';

	let auth0: Auth0Client;
	let isLoading = true;

	onMount(async () => {
		auth0 = await auth.createClient();

		isAuthenticated.set(await auth0.isAuthenticated());
		user.set(await auth0.getUser());
		isLoading = false;
	});

	function login(): void {
		auth.loginWithPopup(auth0);
	}

	function logout(): void {
		auth.logout(auth0);
	}
</script>

{#if $isAuthenticated && $user}
	<a href="/#" on:click={logout}>Log out</a>
{:else if !isLoading}
	<a href="/#" on:click={login}>Log in here</a>
{/if}
