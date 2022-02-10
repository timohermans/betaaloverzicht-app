<script lang="ts">
	import { transactions, transactionsFromAllIbans } from './store';

	let frequencyByIban = {};
	let ibans = [];
	let ibanSelected;
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
			}, [])
			.sort((iban1, iban2) => frequencyByIban[iban2] - frequencyByIban[iban1]);

		transactionsFromAllIbans.set($transactions);
		ibanSelected = ibans[0];
	}

	$: if (ibanSelected) {
		transactions.set($transactionsFromAllIbans.filter((t) => t.iban === ibanSelected));
	}
</script>

<select bind:value={ibanSelected}>
	{#each ibans as iban}
		<option selected={ibanSelected === iban}>{iban}</option>
	{/each}
</select>
