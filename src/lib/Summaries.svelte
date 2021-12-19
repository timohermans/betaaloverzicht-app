<script lang="ts">
	import { ById, transactions } from '$lib/store';
	import Budget from '$lib/Budget.svelte';

	import type { Transaction } from './transaction';

	type TransactionSummary = { name_other_party: string; amount: number };

	type CategorySummary = {
		category: Category;
		amount: number;
		transactions: ById<TransactionSummary>;
	};

	let categoriesById: ById<CategorySummary>;
	let categories: CategorySummary[] = [];

	$: {
		categoriesById = $transactions.reduce(
			(
				summaries: ById<CategorySummary>,
				{ category, name_other_party, amount }: Transaction
			): ById<CategorySummary> => {
				if (!category) return summaries;
				if (!summaries[category.id]) {
					summaries[category.id] = {
						category,
						amount: 0,
						transactions: {}
					};
				}
				if (!summaries[category.id].transactions[name_other_party]) {
					summaries[category.id].transactions[name_other_party] = {
						amount: 0,
						name_other_party
					};
				}

				summaries[category.id].amount += toNumber(amount);
				summaries[category.id].transactions[name_other_party].amount += toNumber(amount);

				return summaries;
			},
			{}
		);

		categories = Object.values(categoriesById).sort(sortByCategoryName);
	}

	function toList(transactions: ById<TransactionSummary>): TransactionSummary[] {
		return Object.values(transactions).sort(sortByNameOtherParty);
	}

	const toNumber = (amount: string) => +amount.replace(',', '.');

	const sortByCategoryName = (c1: CategorySummary, c2: CategorySummary) =>
		c1.name > c2.name ? 1 : -1;

	const sortByNameOtherParty = (t1: TransactionSummary, t2: TransactionSummary) =>
		t1.name_other_party > t2.name_other_party ? 1 : -1;
</script>

<ul>
	{#each categories as summary}
		<li>
			<details>
				<summary class="row">
					<div class="col">
						{summary.category.name}
					</div>
					<div class="col text-end">
						<Budget
							category={summary.category}
							date={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
						/>
					</div>
					<div class="col text-end">
						{summary.amount.toFixed(2)}
					</div>
				</summary>
				{#each toList(summary.transactions) as transaction}
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
