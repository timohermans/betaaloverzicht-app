<script lang="ts">
	import Header from '$lib/Header.svelte';
	import {
		transactions as transactionsFromStore,
		isAuthenticated,
		budgetsByCategoryId,
		setBudgets
	} from '$lib/store';
	import Summaries from '$lib/Summaries.svelte';
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import Totals from '$lib/Totals.svelte';
	import type { Transaction } from '$lib/transaction';
	import { onMount } from 'svelte';
	import { getBudgetsOf, getTransactionsOf } from '$lib/api';

	let transactions: Transaction[];

	onMount(async () => {
		transactions = await getTransactionsOf(new Date());
		transactionsFromStore.set(transactions);
		setBudgets(await getBudgetsOf(new Date()));
	});
</script>

<Header />

<h1>Betaaloverzicht</h1>

{#if !$isAuthenticated}
	<p>Met deze applicatie kun je makkelijk je Rabobank betalingen overzien :)</p>
{:else}
	<TransactionsUpload />

	<section class="mt-3">
		<h2>Overzicht</h2>
		<Totals />
	</section>

	<section>
		<h2>Details</h2>
		<Summaries />
	</section>

	<Transactions />
{/if}
