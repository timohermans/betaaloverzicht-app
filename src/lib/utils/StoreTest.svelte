<script lang="ts">
	import type { Budget, Category, Transaction } from '$lib/types';
	import {
		locale as storeLocale,
		transactions as storeTransactions,
		categories as storeCategories,
		budgetsByCategoryId as storeBudgets,
		transactionsFromAllIbans as storeTransactionsFromAllIbans,
		date as storeDate
	} from '../store';

	export let Component: ConstructorOfATypedSvelteComponent | null | undefined;
	export let locale = 'nl';
	export let date: Date = new Date();
	export let componentProps = {};
	export let transactions: Transaction[] = [];
	export let categories: Category[] = [];
	export let budgets: Budget[] = [];
	export let showStateData = false;

	$: {
		// note for future me:
		// All store variables have to reset here, else state will get leaked across tests
		storeLocale.set(locale);
		storeDate.set(date);
		storeTransactions.set(transactions);
		storeCategories.set(categories);
		storeBudgets.set(budgets.reduce((obj, b) => ({ ...obj, [b.category_id]: b }), {}));
		storeTransactionsFromAllIbans.set([]);
	}
</script>

<svelte:component this={Component} {...componentProps} />

{#if showStateData}
	<ul data-testId="state-transactions">
		{#each $storeTransactions as transaction}
			<li>{JSON.stringify(transaction)}</li>
		{/each}
	</ul>
{/if}
