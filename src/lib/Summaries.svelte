<script lang="ts">
	import { transactions, categories as categoriesFromStore } from '$lib/store';
	import Budget from '$lib/Budget.svelte';

	import type {
		ById,
		CategorySummary,
		TransactionSummary,
		Transaction,
		Category
	} from '$lib/types';
	import BudgetProgress from '$lib/BudgetProgress.svelte';
	import { ignoreCategoryInTotalsBy } from './api';
	import { convertAmount } from './transaction';

	let categoriesById: ById<CategorySummary>;
	let categories: CategorySummary[] = [];
	let hoverId: number = null;

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

				const amountConverted = convertAmount(amount, false);
				summaries[category.id].amount += amountConverted;
				summaries[category.id].transactions[name_other_party].amount += amountConverted;

				return summaries;
			},
			{}
		);

		categories = Object.values(categoriesById).sort(sortByCategoryName);
	}

	function toList(transactions: ById<TransactionSummary>): TransactionSummary[] {
		return Object.values(transactions).sort(sortByNameOtherParty);
	}

	const sortByCategoryName = (c1: CategorySummary, c2: CategorySummary) =>
		c1.category.name > c2.category.name ? 1 : -1;

	const sortByNameOtherParty = (t1: TransactionSummary, t2: TransactionSummary) =>
		t1.name_other_party > t2.name_other_party ? 1 : -1;

	async function ignoreCategoryInTotals({ id, is_ignored_in_totals: isIgnoredInTotals }: Category): Promise<void> {
		await ignoreCategoryInTotalsBy(id, !isIgnoredInTotals);
		categoriesFromStore.set(
			$categoriesFromStore.map((c) => (c.id === id ? { ...c, is_ignored_in_totals: !isIgnoredInTotals } : c))
		);
		transactions.set(
			$transactions.map((t) =>
				t.category?.id === id ? { ...t, category: { ...t.category, is_ignored_in_totals: !isIgnoredInTotals } } : t
			)
		);
	}
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
						<div class="row">
							<div
								class="col text-end"
								on:mouseenter={() => (hoverId = summary.category.id)}
								on:mouseleave={() => (hoverId = null)}
								on:click|preventDefault={() => ignoreCategoryInTotals(summary.category)}
							>
								{summary.amount.toFixed(2)}
								<sup
									class:active={summary.category.is_ignored_in_totals}
									hidden={hoverId !== summary.category.id && !summary.category.is_ignored_in_totals}>👁</sup
								>
							</div>
							<div class="col">
								<BudgetProgress {summary} />
							</div>
							<div class="col">
								<Budget category={summary.category} />
							</div>
						</div>
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

	.active {
		font-weight: bold;
	}
</style>
