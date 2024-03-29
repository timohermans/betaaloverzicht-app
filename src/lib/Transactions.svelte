<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import type { Category, Transaction } from '$lib/types';
	import { date } from '$lib/store';
	import { toMonthQueryString } from './utils/dates';
	import { t } from './i18n';
	import { sortBy, uniqWith } from './utils/collections';
	import { split_transactions_by_week } from './transaction';
	import Badge from './Badge.svelte';

	export let transactions: Transaction[];
	export let categories: Category[];

	let editCategory: string | null = null;
	let editTransaction: Transaction | null = null;
	let editHasSubmitted = false;
	let is_submitting = false;
	let submitted_category_name: string | null = null;
	let isNoCategoryOnlyFilterEnabled = false;
	let modal: HTMLElement;
	let similar_transactions_selected: string[] = [];

	$: editSimilarTransactions = editTransaction
		? transactions.filter((t) => isSimilar(t, editTransaction))
		: [];
	$: transactionsToShow = split_transactions_by_week(
		transactions.filter((t) => (isNoCategoryOnlyFilterEnabled ? t.category == null : true))
	);

	function edit(transaction: Transaction | null) {
		if (editTransaction?.id === transaction?.id) {
			resetForm();
			return;
		}

		resetForm();
		editTransaction = transaction;
		modal.setAttribute('open', '');
		if (transaction?.category) editCategory = transaction.category.name;
	}

	function resetForm() {
		modal.removeAttribute('open');
		editTransaction = null;
		editHasSubmitted = false;
		editCategory = null;
		is_submitting = false;
		submitted_category_name = null;
		similar_transactions_selected = [];
	}

	function withoutSelectedCategory(category: Category) {
		return category.name !== editCategory;
	}

	function updateTransactionsWith(
		categoryByTransactionIdList: { id: string; category: Category }[]
	): void {
		const updated_transactions = transactions.map((t) => {
			const updated = categoryByTransactionIdList.find((ut) => ut?.id === t.id);

			if (updated) {
				return { ...t, category: updated.category };
			}

			return t;
		});

		transactions = updated_transactions;
	}

	function isSimilar(t: Transaction, otherT: Transaction | null): boolean {
		if (!otherT) return false;
		return (
			t.id !== otherT.id &&
			t.name_other_party?.toLowerCase() === otherT.name_other_party?.toLowerCase() &&
			t.category == null
		);
	}

	const handleFormSubmit: SubmitFunction = ({ form, data }) => {
		is_submitting = true;
		submitted_category_name = data.get('name')?.toString() ?? null;

		return ({ result, update }) => {
			if (result.type === 'success' && result.data) {
				const category = result.data['category'] as Category;
				categories = uniqWith(
					[...categories, category].sort(sortBy('name')),
					(a, b) => a.id === b.id
				);
				updateTransactionsWith([
					{ id: editTransaction?.id ?? '-1', category },
					...similar_transactions_selected.map((id) => ({ id, category }))
				]);
			}
			update();
			resetForm();
		};
	};
</script>

<section>
	<h2>{$t('transaction_title')}</h2>

	{#if transactions.length > 0}
		<div class="grid">
			<div>
				<input
					bind:checked={isNoCategoryOnlyFilterEnabled}
					type="checkbox"
					class="form-check-input"
					id="filterNoCategory"
				/>
				<label for="filterNoCategory" class="form-check-label">zonder categorie</label>
			</div>
		</div>
	{/if}

	<figure>
		<table>
			<tbody>
				{#each Object.keys(transactionsToShow) as week}
					<tr id="week-{week}">
						<td colspan="7"><b><i>{$t('week')} {week}</i></b></td>
					</tr>
					{#each transactionsToShow[+week] as transaction}
						<tr class="clickable" on:click={() => edit(transaction)}>
							<td class="nowrap">{new Date(transaction.date_transaction).toLocaleDateString()}</td>
							<td><b>{transaction.name_other_party}</b></td>
							<td>
								<Badge type={transaction.amount.startsWith('-') ? 'danger' : 'success'}>
									{transaction.amount}
								</Badge>
							</td>
							<td>
								{#if transaction.authorization_code}
									<span>🔒</span>
								{/if}
							</td>
							<td>
								{#if transaction.category}
									<span>{transaction.category.name}</span>
								{/if}

								{#if editTransaction?.id !== transaction.id && !transaction.category}
									<span class="fst-italic">Nog geen categorieen</span>
								{/if}
							</td>
							<td>{transaction.iban}</td>
							<td class="col-12 col-xl-4 nowrap">{transaction.description}</td>
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</figure>
</section>

<dialog bind:this={modal} on:click={() => edit(editTransaction)} on:keyup={() => {}}>
	{#if editTransaction}
		<article on:click|stopPropagation on:keyup|stopPropagation>
			<header>
				<div style="display: flex; justify-content: space-between">
					<div>
						<div><strong>{editTransaction.name_other_party}</strong></div>
						<p><i>{editTransaction.description}</i></p>
					</div>
					<div style="text-align: right;">
						<div><i>{new Date(editTransaction.date_transaction).toLocaleDateString()}</i></div>
						<div
							class:error={editTransaction.amount.startsWith('-')}
							class:success={editTransaction.amount.startsWith('+')}
							class="amount"
						>
							{editTransaction.amount}
						</div>
					</div>
				</div>
			</header>
			<div>
				<section>
					{#if editSimilarTransactions.length > 0}
						<div>
							{$t('transaction_assign_similar_label', { count: editSimilarTransactions.length })}
						</div>
						<ul class="similar">
							{#each editSimilarTransactions as transaction}
								<li class="fst-italic text-muted">
									<label for={transaction.id}>
										<input
											id={transaction.id}
											bind:group={similar_transactions_selected}
											value={transaction.id}
											name="other_transaction_ids"
											type="checkbox"
										/>
										{new Date(transaction.date_transaction).toLocaleDateString()}
										<em data-tooltip={transaction.description}>{transaction.name_other_party}</em>
										{transaction.amount}</label
									>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
				<form
					class:was-validated={editHasSubmitted}
					method="post"
					use:enhance={handleFormSubmit}
					action="?/assign_category&{toMonthQueryString($date)}"
				>
					<input type="hidden" name="transaction_id" value={editTransaction.id} />
					<label for="category">Categorie toevoegen</label>
					<div>
						<input
							id="category"
							class="form-control"
							type="text"
							placeholder="Vervoer, vaste lasten, etc.."
							name="name"
							required
						/>
						{#each similar_transactions_selected as id}
							<input type="hidden" name="transaction_id" value={id} />
						{/each}
						<button
							hidden
							id="submit"
							aria-busy={is_submitting &&
								!categories.some((c) => c.name === submitted_category_name)}
							type="submit"
							class="btn btn-outline-primary mb-3">Save</button
						>
					</div>
				</form>

				<p>{$t('transaction_assign_select_existing_category')}</p>

				<ul class="existing-categories">
					{#each categories.filter(withoutSelectedCategory) as category}
						<li>
							<form
								method="post"
								use:enhance={handleFormSubmit}
								action="?/assign_category&{toMonthQueryString($date)}"
							>
								<input type="hidden" name="transaction_id" value={editTransaction.id} />
								{#each similar_transactions_selected as id}
									<input type="hidden" name="transaction_id" value={id} />
								{/each}
								<input type="hidden" name="name" value={category.name} />
								<button
									type="submit"
									class="nowrap"
									aria-busy={is_submitting && submitted_category_name === category.name}
									>{category.name}</button
								>
							</form>
						</li>
					{/each}
				</ul>
			</div>
		</article>
	{/if}
</dialog>

<style>
	ul {
		margin: 0;
		padding: 0;
	}

	ul > li {
		list-style-type: none;
	}

	.nowrap {
		white-space: nowrap;
	}

	.similar {
		display: block;
	}

	em::before {
		width: 250px;
		white-space: unset;
	}

	.existing-categories form,
	.existing-categories button {
		margin-bottom: 0;
	}
</style>
