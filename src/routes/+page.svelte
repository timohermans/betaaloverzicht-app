<script lang="ts">
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import { date } from '$lib/store';
	import Accounts from '$lib/Accounts.svelte';
	import type { ActionData, PageData } from './$types';
	import TotalsNew from '$lib/Totals_new.svelte';
	import Summaries from '$lib/Summaries.svelte';
	import { extract_ibans_from } from '../lib/transaction';

	export let form: ActionData;
	export let data: PageData;
	date.set(data.date);

	const ibans = extract_ibans_from(data.transactions);
	let iban = ibans[0];

	let categories = data.categories;
	let transactions = data.transactions.filter((t) => t.iban === iban);
</script>

<svelte:head>
	<title>Budget {$date?.getFullYear() || 0}-{($date?.getMonth() || 0) + 1}</title>
</svelte:head>

<main class="container">
	<Accounts {ibans} bind:value={iban} />
	<TotalsNew {transactions} {ibans} />
	<!-- <Totals /> -->
	<Summaries {categories} {transactions} />

	<Transactions {transactions} {categories} />
	<TransactionsUpload {form} />
</main>

<style>
	:global(ul) {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		list-style-type: none;
	}

	:global(ul > li) {
		list-style-type: none;
	}
</style>
