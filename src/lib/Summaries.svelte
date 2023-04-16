<script lang="ts">
	import type {
		ById,
		CategorySummary,
		TransactionSummary,
		Transaction,
		Category
	} from '$lib/types';
	import BudgetProgress from '$lib/BudgetProgress.svelte';
	import { to_number } from './transaction';
	import { t } from './i18n';

	export let categories: Category[];
	export let transactions: Transaction[];

	let categoriesById: ById<CategorySummary>;
	let category_summaries: CategorySummary[] = [];
	let modal: HTMLElement;
	let summaryActive: CategorySummary | null;

	$: {
		categoriesById = createSummariesFrom(transactions);

		category_summaries = Object.values(categoriesById).sort(sortByCategoryName);
	}
	$: transaction_amounts = transactions.map((t) => to_number(t.amount));
	$: total_expenses = transaction_amounts
		.filter((t) => t < 0)
		.reduce((total, amount) => total + amount, 0);
	$: total_income = transaction_amounts
		.filter((t) => t > 0)
		.reduce((total, amount) => total + amount, 0);

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
				const other_party_name = name_other_party ?? 'unknown';
				if (!summaries[category.id].transactions[other_party_name]) {
					summaries[category.id].transactions[other_party_name] = {
						amount: 0,
						name_other_party: other_party_name
					};
				}

				const amountConverted = to_number(amount);
				summaries[category.id].amount += amountConverted;
				summaries[category.id].transactions[other_party_name].amount += amountConverted;

				return summaries;
			},
			{}
		);
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

<section>
	<h2>{$t('summaries_title')}</h2>

	<ul>
		{#each category_summaries as summary, index}
			<li class="summary">
				<a
					href="/#"
					on:click|preventDefault={() => openDialogFor(summary)}
					class="clickable summary-details-button"
					style="float: right"
				>
					🕵🏻‍♂️
				</a>
				<BudgetProgress {summary} {total_expenses} {total_income} />
				<strong>{summary.category.name}</strong>
				<div>{summary?.amount.toFixed(2)}</div>
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
</section>

<style>
	ul > li {
		list-style-type: none;
	}

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
