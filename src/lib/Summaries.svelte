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
	import { convertAmount } from './transaction';

	let categoriesById: ById<CategorySummary>;
	let categories: CategorySummary[] = [];
	let modal: HTMLElement;
	let summaryActive: CategorySummary | null;

	$: {
		categoriesById = createSummariesFrom($transactions);
		categoriesById = createSummariesForEmpty($categoriesFromStore, categoriesById);

		categories = Object.values(categoriesById).sort(sortByCategoryName);
	}

	function createSummariesFrom(transactions: Transaction[]): ById<CategorySummary> {
		return transactions.reduce(
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
	}

	function createSummariesForEmpty(
		categories: Category[],
		categoriesById: ById<CategorySummary>
	): ById<CategorySummary> {
		categories.forEach((c) => {
			if (c.id in categoriesById) return;
			categoriesById = { ...categoriesById, [c.id]: { category: c, amount: 0, transactions: {} } };
		});

		return categoriesById;
	}

	function toList(transactions: ById<TransactionSummary>): TransactionSummary[] {
		return Object.values(transactions).sort(sortByNameOtherParty);
	}

	const sortByCategoryName = (c1: CategorySummary, c2: CategorySummary) =>
		c1.category.name > c2.category.name ? 1 : -1;

	const sortByNameOtherParty = (t1: TransactionSummary, t2: TransactionSummary) =>
		t1.name_other_party > t2.name_other_party ? 1 : -1;

	function openDialogFor(summary: CategorySummary) {
		summaryActive = summary;
		modal.setAttribute('open', '');
	}

	function closeDialog() {
		summaryActive = null;
		modal.removeAttribute('open');
	}
</script>

<ul>
	{#each categories as summary, index}
		<li class="summary">
			<a
				href="/#"
				on:click|preventDefault={() => openDialogFor(summary)}
				class="clickable summary-details-button"
				style="float: right"
			>
				🕵🏻‍♂️
			</a>
			<BudgetProgress {summary} />
			<strong>{summary.category.name}</strong>
			<Budget {summary} />
		</li>
	{/each}
</ul>

<dialog bind:this={modal} on:click={closeDialog} on:keyup={() => {}}>
	{#if summaryActive}
		<article>
			<header>{summaryActive.category.name}</header>
			{#each toList(summaryActive.transactions) as transaction}
				<div>
					<div>{transaction.name_other_party}</div>
					<div>{transaction.amount.toFixed(2)}</div>
				</div>
			{/each}
		</article>
	{/if}
</dialog>

<style>
	.summary {
		padding: calc(var(--spacing) / 2);
		border-radius: var(--border-radius);
		background: var(--code-background-color);
		font-size: 87.5%;
		min-width: 150px;
	}

	.active {
		font-weight: bold;
	}

	.summary-details-button {
		cursor: pointer;
		width: 25px;
		height: 25px;
	}

	article {
		min-width: 400px;
		max-width: 500px;
	}

	article > div {
		display: flex;
		justify-content: space-between;
		padding: var(--spacing);
		gap: var(--spacing);
	}
</style>
