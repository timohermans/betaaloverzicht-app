<script lang="ts">
	import { t } from './i18n';
	import { ibans, transactions, transactionsFromAllIbans } from './store';

	let ibanSelected: string;

	$: if (ibanSelected && $ibans.includes(ibanSelected)) {
		transactions.set($transactionsFromAllIbans.filter((t) => t.iban === ibanSelected));
	}
</script>

<select bind:value={ibanSelected}>
	{#each $ibans as iban}
		<option selected={ibanSelected === iban}>{iban}</option>
	{:else}
		<option>{$t('accounts_no_accounts_yet')}</option>
	{/each}
</select>
