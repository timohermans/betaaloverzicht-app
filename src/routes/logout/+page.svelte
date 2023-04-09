<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<main class="container">
	<form method="post">
		<p>{$t('logout_message')}</p>
		<button type="submit" class="secondary">{$t('logout_confirm')}</button>
	</form>
</main>
