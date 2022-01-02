<script lang="ts">
	import Header from '$lib/Header.svelte';
	import {
		transactions as transactionsFromStore,
		isAuthenticated,
		setBudgets,
		categories
	} from '$lib/store';
	import Summaries from '$lib/Summaries.svelte';
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import Totals from '$lib/Totals.svelte';
	import { getBudgetsOf, getCategories, getTransactionsOf } from '$lib/api';
	import { date } from '$lib/store';
	import MonthPicker from '../lib/MonthPicker.svelte';

	// TODO: (L) Add seperate Auth0 instance for production
	// TODO: (M) Add favicon
	// TODO: (M) Add title

	async function updateTransactions(): Promise<void> {
		const transactions = await getTransactionsOf($date);
		transactionsFromStore.set(transactions);
	}

	$: if ($date && $isAuthenticated) {
		updateTransactions().then();
		getBudgetsOf($date).then((b) => setBudgets(b));
		getCategories().then((c) => categories.set(c));
	}
</script>

<svelte:head>
	<title>Budget {$date?.getFullYear() || 0}-{$date?.getMonth() || 0}</title>
</svelte:head>

<Header />
<MonthPicker />

{#if !$isAuthenticated}
	<p>Met deze applicatie kun je makkelijk je Rabobank betalingen overzien :)</p>
{:else}
	<Totals />
	<Summaries />

	<Transactions />
	<TransactionsUpload onTransactionsUploaded={updateTransactions} />
{/if}
