<script lang="ts">
	import {
		categories as store_categories,
		transactions as store_transactions,
		transactionsFromAllIbans
	} from '$lib/store';
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import Totals from '$lib/Totals.svelte';
	import { date } from '$lib/store';
	import Accounts from '$lib/Accounts.svelte';
	import type { ActionData, PageData } from './$types';
	import TotalsNew from '$lib/Totals_new.svelte';
	import Summaries from '$lib/Summaries.svelte';

	export let form: ActionData;
	export let data: PageData;
	transactionsFromAllIbans.set(data.transactions);
	store_categories.set(data.categories);
	date.set(data.date);

	$: categories = $store_categories ?? data.categories;
	$: transactions = $store_transactions ?? data.transactions;
</script>

<svelte:head>
	<title>Budget {$date?.getFullYear() || 0}-{($date?.getMonth() || 0) + 1}</title>
</svelte:head>

<main class="container">
	<Accounts />
	<TotalsNew {transactions} />
	<!-- <Totals /> -->
	<Summaries {categories} {transactions} />

	<Transactions {transactions} />
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
