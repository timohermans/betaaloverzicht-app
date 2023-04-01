<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from './i18n';
	import { login_with, logout } from '$lib/auth';
	import { pb } from './api';
	import { Collections } from './book_types';

	let is_submitted = false;
	let has_login_failed = false;
	let username: string;
	let password: string;

	onMount(async () => {
		try {
			await pb.collection(Collections.Users).authRefresh();
		} catch (error) {
			do_logout();
		}
	});

	async function login() {
		try {
			await login_with(username, password);
		} catch (error) {
			has_login_failed = true;
		}
	}

	function do_logout(): void {
		logout();
	}
</script>

<form class:is_submitted class:has_login_failed on:submit|preventDefault={login}>
	{#if has_login_failed}
		<div class="error">
			{$t('login_incorrect_message')}
		</div>
	{/if}
	<div>
		<label for="username">{$t('login_username_label')}</label>
		<input id="username" bind:value={username} required />
	</div>
	<div>
		<label for="password">{$t('login_password_label')}</label>
		<input id="password" type="password" bind:value={password} required />
	</div>
	<div>
		<button type="submit">{$t('login_login_button')}</button>
	</div>
</form>

<style>
	.error {
		border-radius: 0.5rem;
		background-color: #ff2100;
		color: white;
		padding: 15px 20px;
		margin-bottom: 20px;
	}

	.is_submitted.has_login_failed input {
		border: 1px solid #c00;
	}

	.is_submitted.has_login_failed input {
		outline: 1px solid #c00;
	}
</style>
