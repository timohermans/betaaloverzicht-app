<script lang="ts">
	import type { Budget, Category, Transaction } from '$lib/types';
	import {
		transactions as storeTransactions,
		categories as storeCategories,
		budgetsByCategoryId as storeBudgets
	} from '../store';

	export let Component;
	export let componentProps: any = {};
	export let transactions: Transaction[] = [];
	export let categories: Category[] = [];
	export let budgets: Budget[] = [];

	$: {
		storeTransactions.set(transactions);
	}

	$: {
		storeCategories.set(categories);
	}

	$: {
		storeBudgets.set(budgets.reduce((obj, b) => ({ ...obj, [b.category_id]: b }), {}));
	}
</script>

<svelte:component this={Component} {...componentProps} />
