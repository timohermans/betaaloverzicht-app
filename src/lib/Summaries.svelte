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

		$categoriesFromStore.forEach((c) => {
			if (c.id in categoriesById) return;
			categoriesById[c.id] = { category: c, amount: 0, transactions: {} };
		});

		categories = Object.values(categoriesById).sort(sortByCategoryName);
	}

	function toList(transactions: ById<TransactionSummary>): TransactionSummary[] {
		return Object.values(transactions).sort(sortByNameOtherParty);
	}

	const sortByCategoryName = (c1: CategorySummary, c2: CategorySummary) =>
		c1.category.name > c2.category.name ? 1 : -1;

	const sortByNameOtherParty = (t1: TransactionSummary, t2: TransactionSummary) =>
		t1.name_other_party > t2.name_other_party ? 1 : -1;

	async function ignoreCategoryInTotals({
		id,
		is_ignored_in_totals: isIgnoredInTotals
	}: Category): Promise<void> {
		await ignoreCategoryInTotalsBy(id, !isIgnoredInTotals);
		categoriesFromStore.set(
			$categoriesFromStore.map((c) =>
				c.id === id ? { ...c, is_ignored_in_totals: !isIgnoredInTotals } : c
			)
		);
		transactions.set(
			$transactions.map((t) =>
				t.category?.id === id
					? { ...t, category: { ...t.category, is_ignored_in_totals: !isIgnoredInTotals } }
					: t
			)
		);
	}
</script>

<section class="cluster">
	{#each categories as summary, index}
		<div class="summary">
			<BudgetProgress {summary} />
			<div
				on:mouseenter={() => (hoverId = summary.category.id)}
				on:mouseleave={() => (hoverId = null)}
				on:click|preventDefault={() => ignoreCategoryInTotals(summary.category)}
			>
				<strong>{summary.category.name}</strong>
				<sup
					class:active={summary.category.is_ignored_in_totals}
					hidden={hoverId !== summary.category.id && !summary.category.is_ignored_in_totals}>🙈</sup
				>
			</div>
			<Budget {summary} />
		</div>
	{/each}
</section>

<style>
	.cluster {
		display: flex;
		gap: var(--spacing);
		flex-wrap: wrap;
		justify-content: center;
	}

	.cluster > * {
		padding: calc(var(--spacing) / 2);
		border-radius: var(--border-radius);
		background: var(--code-background-color);
		font-size: 87.5%;
		/* text-align: center; */
		min-width: 200px;
	}
	.active {
		font-weight: bold;
	}
</style>
