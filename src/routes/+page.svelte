<script lang="ts">
	import Transactions from '$lib/Transactions.svelte';
	import TransactionsUpload from '$lib/TransactionsUpload.svelte';
	import { date } from '$lib/store';
	import Accounts from '$lib/Accounts.svelte';
	import type { ActionData, PageData } from './$types';
	import Weekly_budget from '$lib/Weekly_budget.svelte';
	import Summaries from '$lib/Summaries.svelte';
	import { extract_ibans_from, to_number } from '$lib/transaction';
	import Month_statistics from '../Month_statistics.svelte';

	export let form: ActionData;
	export let data: PageData;
	date.set(data.date);

	const ibans = extract_ibans_from(data.transactions);
	let iban = ibans[0];

	let categories = data.categories;
	let transactions = data.transactions.filter((t) => t.iban === iban);

	let total_income = data.transactions_prior_month.reduce(
		(acc, t) =>
			t.iban === iban && !ibans.includes(t.iban_other_party || '') && t.amount.startsWith('+')
				? (acc += to_number(t.amount))
				: acc,
		0
	);
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
	<Weekly_budget date={data.date} transactions={data.transactions_prior_month} {ibans} />
	<hr />
	<Month_statistics {total_income} transactions={data.transactions} />
	<hr />
	<Summaries {categories} {transactions} {total_income} />
	<hr />
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
