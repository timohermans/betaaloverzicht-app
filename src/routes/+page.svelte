<script lang="ts">
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import { date } from '$lib/store';
	import Accounts from '$lib/Accounts.svelte';
	import type { ActionData, PageData } from './$types';
	import Weekly_budget from '$lib/Weekly_budget.svelte';
	import Summaries from '$lib/Summaries.svelte';
	import Month_statistics from '../Month_statistics.svelte';

	export let form: ActionData;
	export let data: PageData;
	date.set(data.date);

	const ibans = data.ibans;
	let iban = data.iban;
	let categories = data.categories;
	let transactions = data.summary.transactions;
	let number_of_weeks = Object.keys(data.summary.variable_expenses_per_week).length;
	const weekly_budget =
		(data.summary.prior_actual_income + data.summary.prior_fixed_expenses) / number_of_weeks;
</script>

<svelte:head>
	<title>Budget {$date?.getFullYear() || 0}-{($date?.getMonth() || 0) + 1}</title>
</svelte:head>

<main class="container">
	<Accounts {ibans} bind:value={iban} />
	<hgroup>
		<h1>{data.date.toLocaleString('default', { month: 'long' })} {data.date.getFullYear()}</h1>
		<h2>Overzicht van deze maand</h2>
	</hgroup>
	<hr />
	<Weekly_budget
		prior_fixed={data.summary.prior_fixed_expenses}
		prior_income={data.summary.prior_actual_income}
		{weekly_budget}
	/>
	<hr />
	<Month_statistics {weekly_budget} summary={data.summary} />
	<hr />
	<Summaries {categories} {transactions} total_income={data.summary.prior_actual_income} />
	<hr />
	<Transactions {transactions} {categories} />
	<hr />
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
