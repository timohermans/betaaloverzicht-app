<script lang="ts">
	import type { Budget, Category, Transaction } from '$lib/types';
	import {
		transactions as storeTransactions,
		categories as storeCategories,
		budgetsByCategoryId as storeBudgets,
		date as storeDate
	} from '../store';

	export let Component;
	export let date: Date = new Date();
	export let componentProps = {};
	export let events: { eventName: string; handler: () => void }[] = [];
	export let transactions: Transaction[] = [];
	export let categories: Category[] = [];
	export let budgets: Budget[] = [];

	let componentInstance;

	$: {
		storeDate.set(date);
		storeTransactions.set(transactions);
		storeCategories.set(categories);
		storeBudgets.set(budgets.reduce((obj, b) => ({ ...obj, [b.category_id]: b }), {}));
	}
</script>

<svelte:component this={Component} bind:this={componentInstance} {...componentProps} />
