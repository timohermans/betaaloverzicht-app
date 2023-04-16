<script lang="ts">
	import { t } from './i18n';

	export let ibans: string[];
	export let value: string;
</script>

<select bind:value>
	{#each ibans as iban}
		<option selected={value === iban}>{iban}</option>
	{:else}
		<option>{$t('accounts_no_accounts_yet')}</option>
	{/each}
</select>
