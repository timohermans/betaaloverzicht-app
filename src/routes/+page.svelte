<script lang="ts">
	import Header from '$lib/Header.svelte';
	import {
		transactions as transactionsFromStore,
		setBudgets,
		categories,
		current_user
	} from '$lib/store';
	import Summaries from '$lib/Summaries.svelte';
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import Totals from '$lib/Totals.svelte';
	import { getBudgetsOf, getCategories, getTransactionsOf } from '$lib/api';
	import { date } from '$lib/store';
	import MonthPicker from '../lib/MonthPicker.svelte';
	import Accounts from '../lib/Accounts.svelte';
	import Authentication from '$lib/Authentication.svelte';

	async function getTransactionOfPreviousMonth(): Promise<void> {
		if (!$date) return;
		const previousMonth = new Date($date.setMonth($date.getMonth() - 1));
		const transactions = await getTransactionsOf(previousMonth);
	}

	async function updateTransactions(): Promise<void> {
		const transactions = await getTransactionsOf($date);
		transactionsFromStore.set(transactions);
	}

	$: if ($date && $current_user) {
		updateTransactions()
			.then(() => getTransactionOfPreviousMonth())
			.then();

		getBudgetsOf($date).then((b) => setBudgets(b));
		getCategories().then((c) => categories.set(c));
	}
</script>

<svelte:head>
	<title>Budget {$date?.getFullYear() || 0}-{($date?.getMonth() || 0) + 1}</title>
</svelte:head>

<Header />
<MonthPicker />

{#if !$current_user}
	<section class="container">
		<div class="grid">
			<div />
			<div>
				<p>Met deze applicatie kun je makkelijk je Rabobank betalingen overzien :)</p>
				<Authentication />
			</div>
			<div />
		</div>
	</section>
{:else}
	<main class="container">
		<Accounts />
		<Totals />
		<Summaries />

		<Transactions />
		<TransactionsUpload onTransactionsUploaded={updateTransactions} />
	</main>
{/if}
