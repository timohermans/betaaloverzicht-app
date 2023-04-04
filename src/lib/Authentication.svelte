<script lang="ts">
	import { t } from './i18n';

	let is_submitted = false;
	let has_login_failed = false;
</script>

<section class="grid">
	<div />
	<form method="post" class:is_submitted class:has_login_failed>
		{#if has_login_failed}
			<div class="error">
				{$t('login_incorrect_message')}
			</div>
		{/if}
		<div>
			<label for="username">{$t('login_username_label')}</label>
			<input id="username" name="username" required />
		</div>
		<div>
			<label for="password">{$t('login_password_label')}</label>
			<input id="password" type="password" name="password" required />
		</div>
		<div>
			<button type="submit">{$t('login_login_button')}</button>
		</div>
	</form>
	<div />
</section>

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
