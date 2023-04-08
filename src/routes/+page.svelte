<script lang="ts">
	import { categories, transactionsFromAllIbans as transactionsFromStore } from '$lib/store';
	import Summaries from '$lib/Summaries.svelte';
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import Totals from '$lib/Totals.svelte';
	import { date } from '$lib/store';
	import Accounts from '../lib/Accounts.svelte';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;
	transactionsFromStore.set(data.transactions);
	categories.set(data.categories);
	date.set(data.date);
</script>

<svelte:head>
	<title>Budget {$date?.getFullYear() || 0}-{($date?.getMonth() || 0) + 1}</title>
</svelte:head>

<main class="container">
	<Accounts />
	<Totals />
	<Summaries />

	<Transactions />
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
