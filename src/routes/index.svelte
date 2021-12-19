<script lang="ts">
	import Header from '$lib/Header.svelte';
	import { transactions as transactionsFromStore, isAuthenticated } from '$lib/store';
	import TransactionsDetails from '$lib/TransactionsDetails.svelte';
	import TransactionsOverview from '$lib/TransactionsOverview.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import TransactionsSummary from '$lib/TransactionsSummary.svelte';
	import type { Transaction } from '$lib/transaction';
	import { onMount } from 'svelte';
	import { getTransactionsOf } from '$lib/api';

	let transactions: Transaction[];

	onMount(async () => {
		transactions = await getTransactionsOf(new Date());
		transactionsFromStore.set(transactions);
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
		<TransactionsSummary />
	</section>

	<section>
		<h2>Details</h2>
		<TransactionsDetails />
	</section>

	<TransactionsOverview />
{/if}
