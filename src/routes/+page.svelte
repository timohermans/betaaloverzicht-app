<script lang="ts">
	import { categories, transactions as transactionsFromStore } from '$lib/store';
	import Summaries from '$lib/Summaries.svelte';
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import Totals from '$lib/Totals.svelte';
	import { date } from '$lib/store';
	import Accounts from '../lib/Accounts.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	transactionsFromStore.set(data.transactions);
	categories.set(data.categories);
</script>

<svelte:head>
	<title>Budget {$date?.getFullYear() || 0}-{($date?.getMonth() || 0) + 1}</title>
</svelte:head>

<main class="container">
	<Accounts />
	<Totals />
	<Summaries />

	<Transactions />
	<TransactionsUpload onTransactionsUploaded={() => {}} />
</main>
