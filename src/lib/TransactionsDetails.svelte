<script lang="ts">
	import { onMount } from 'svelte';
	import { getTransactionsOf } from './api';

	import type { Transaction } from './transaction';

	type CategorySummary = {
		name: string;
		amount: number;
		transactions: Transaction[];
	};

	let transactions: Transaction[] = [];
	let categories: CategorySummary[] = [];

	onMount(async () => {
		transactions = await getTransactionsOf(new Date());

		categories = transactions.reduce(
			(summaries: CategorySummary[], transaction: Transaction): CategorySummary[] => {
				if (!transaction.category) return summaries;

				if (!summaries.some(existingSummaryFor(transaction)))
					summaries.push({
						name: transaction.category.name,
						amount: 0,
						transactions: [transaction]
					});

				const grouping = summaries.find(existingSummaryFor(transaction));

				grouping.amount += +transaction.amount.replace(',', '.');
				grouping.transactions = [...grouping.transactions, transaction];

				return summaries;
			},
			[] as CategorySummary[]
		);
	});

	const existingSummaryFor =
		(t: Transaction) =>
		(g: CategorySummary): boolean =>
			g.name === t.category.name;
</script>

<ul>
	{#each categories as category}
		<li class="row">
			<div class="col">
				{category.name}
			</div>
			<div class="col text-end">
				{category.amount.toFixed(2)}
			</div>
		</li>
	{/each}
</ul>

<style>
	.col {
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
		border: 1px solid rgba(39, 41, 43, 0.1);
	}
</style>
