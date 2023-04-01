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
	import { getBudgetsOf, getCategories, getTransactionsOf, pb } from '$lib/api';
	import { date } from '$lib/store';
	import MonthPicker from '../lib/MonthPicker.svelte';
	import Accounts from '../lib/Accounts.svelte';
	import Authentication from '$lib/Authentication.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	onMount(() => {
		transactionsFromStore.set(data.transactions);
	});
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
