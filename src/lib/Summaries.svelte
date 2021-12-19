<script lang="ts">
	import { transactions } from '$lib/store';

	import type { Transaction } from './transaction';

	type TransactionSummary = { name_other_party: string; amount: number };

	type CategorySummary = {
		name: string;
		amount: number;
		transactions: TransactionSummary[];
	};

	let categories: CategorySummary[] = [];

	$: {
		categories = $transactions
			.reduce((summaries: CategorySummary[], transaction: Transaction): CategorySummary[] => {
				if (!transaction.category) return summaries;
				const newSummaries = updateSummariesWith(transaction, summaries);

				return newSummaries.map((s) => {
					if (!isSummaryFor(transaction)(s)) return s;
					return {
						...s,
						amount: (s.amount += +transaction.amount.replace(',', '.')),
						transactions: tryMergeTransactionToSummaryTransactions(s.transactions, transaction)
					};
				});
			}, [] as CategorySummary[])
			.sort(sortByCategoryName);

		categories.forEach((c) =>
			c.transactions.sort((t1, t2) => (t1.name_other_party > t2.name_other_party ? 1 : -1))
		);
	}

	function updateSummariesWith(
		transaction: Transaction,
		summaries: CategorySummary[]
	): CategorySummary[] {
		if (summaries.some(isSummaryFor(transaction))) {
			return summaries;
		}

		return [
			...summaries,
			{
				name: transaction.category.name,
				amount: 0,
				transactions: []
			}
		];
	}

	function tryMergeTransactionToSummaryTransactions(
		summaries: TransactionSummary[],
		transaction: Transaction
	): TransactionSummary[] {
		const transactionSummaries = !summaries.some(hasOtherPartyName(transaction))
			? [...summaries, { name_other_party: transaction.name_other_party, amount: 0 }]
			: summaries;

		return transactionSummaries.map((s) => {
			if (!hasOtherPartyName(transaction)(s)) return s;

			return {
				...s,
				amount: s.amount + +transaction.amount.replace(',', '.')
			};
		});
	}

	const hasOtherPartyName = (t1: Transaction) => (t2: TransactionSummary) =>
		t1.name_other_party === t2.name_other_party;

	const isSummaryFor =
		(t: Transaction) =>
		(g: CategorySummary): boolean =>
			g.name === t.category.name;

	const sortByCategoryName = (c1: CategorySummary, c2: CategorySummary) =>
		c1.name > c2.name ? 1 : -1;
</script>

<ul>
	{#each categories as category}
		<li>
			<details>
				<summary class="row">
					<div class="col">
						{category.name}
					</div>
					<div class="col text-end">100.00</div>
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
