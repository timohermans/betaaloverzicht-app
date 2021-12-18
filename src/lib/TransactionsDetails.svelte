<script lang="ts">
	import { transactions } from '$lib/store';

	import type { Transaction } from './transaction';

	type CategorySummary = {
		name: string;
		amount: number;
		transactions: { name_other_party: string; amount: number }[];
	};

	let categories: CategorySummary[] = [];

	$: {
		categories = $transactions
			.reduce((summaries: CategorySummary[], transaction: Transaction): CategorySummary[] => {
				if (!transaction.category) return summaries;

				if (!summaries.some(existingSummaryFor(transaction)))
					summaries.push({
						name: transaction.category.name,
						amount: 0,
						transactions: []
					});

				const grouping = summaries.find(existingSummaryFor(transaction));

				grouping.amount += +transaction.amount.replace(',', '.');

				// TODO: (S) Refactor the transaction sublist
				if (
					!grouping.transactions.some((t) => t.name_other_party === transaction.name_other_party)
				) {
					grouping.transactions = [
						...grouping.transactions,
						{ name_other_party: transaction.name_other_party, amount: 0 }
					];
				}

				grouping.transactions.find(
					(t) => t.name_other_party === transaction.name_other_party
				).amount += +transaction.amount.replace(',', '.');

				return summaries;
			}, [] as CategorySummary[])
			.sort((s1, s2) => (s1.name > s2.name ? 1 : -1));

		categories.forEach((c) =>
			c.transactions.sort((t1, t2) => (t1.name_other_party > t2.name_other_party ? 1 : -1))
		);
	}

	const existingSummaryFor =
		(t: Transaction) =>
		(g: CategorySummary): boolean =>
			g.name === t.category.name;
</script>

<ul>
	{#each categories as category}
		<li>
			<details>
				<summary class="row">
					<div class="col">
						{category.name}
					</div>
					<div class="col text-end">
						{category.amount.toFixed(2)}
					</div>
				</summary>
				{#each category.transactions as transaction}
					<div class="row">
						<div class="col" />
						<div class="col">{transaction.name_other_party}</div>
						<div class="col text-end pe-5">{transaction.amount.toFixed(2)}</div>
					</div>
				{/each}
			</details>
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding: 0;
	}

	li {
		list-style-type: none;
	}
	.col {
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
		border: 1px solid rgba(39, 41, 43, 0.1);
	}
</style>
