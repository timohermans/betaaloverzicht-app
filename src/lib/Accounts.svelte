<script lang="ts">
	import { t } from './i18n';
	import { transactions, transactionsFromAllIbans } from './store';

	let frequencyByIban: { [key: string]: number } = {};
	let ibans: string[] = [];
	let ibanSelected: string;
	$: if (
		$transactionsFromAllIbans.length === 0 ||
		$transactions.length > $transactionsFromAllIbans.length
	) {
		ibans = $transactions
			.reduce((ibanList, transaction) => {
				if (ibanList.length === 0) frequencyByIban = {};
				if (!ibanList.includes(transaction.iban)) {
					frequencyByIban[transaction.iban] = 0;
					ibanList.push(transaction.iban);
				}
				frequencyByIban[transaction.iban]++;
				return ibanList;
			}, [] as string[])
			.sort((iban1, iban2) => frequencyByIban[iban2] - frequencyByIban[iban1]);

		transactionsFromAllIbans.set($transactions);
		if (ibans.length > 0) ibanSelected = ibans[0];
	}

	$: if (ibanSelected && ibans.includes(ibanSelected)) {
		transactions.set($transactionsFromAllIbans.filter((t) => t.iban === ibanSelected));
	}
</script>

<select bind:value={ibanSelected}>
	{#each ibans as iban}
		<option selected={ibanSelected === iban}>{iban}</option>
	{:else}
		<option>{$t('accounts_no_accounts_yet')}</option>
	{/each}
</select>
