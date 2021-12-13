<script lang="ts">
	import { onMount } from 'svelte';
	import { getTransactionsOf } from './api';

	import type { Transaction } from './transaction';

	type CategorySummary = {
		name: string;
		amount: number;
	};

	let transactions: Transaction[] = [];
	let categories: CategorySummary[] = [];

	onMount(async () => {
		transactions = await getTransactionsOf(new Date());

		categories = transactions.reduce(
			(summaries: CategorySummary[], transaction: Transaction): CategorySummary[] => {
				if (!transaction.category) return summaries;

				if (!summaries.some(existingSummaryFor(transaction)))
					summaries.push({ name: transaction.category.name, amount: 0 });

				const grouping = summaries.find(existingSummaryFor(transaction));

				grouping.amount += +transaction.amount.replace(',', '.');

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
			<div class="col">
				{category.amount.toFixed(2)}
			</div>
		</li>
	{/each}
</ul>
