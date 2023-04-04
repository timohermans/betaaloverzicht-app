<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import type { Category, Transaction } from '$lib/types';
	import { assignCategoryTo, getAllTransactions } from '$lib/api';
	import { transactions, categories, date } from '$lib/store';
	import { toMonthQueryString } from './utils/dates';
	import { t } from './i18n';

	let editCategory: string | null = null;
	let is_submitting = false;
	let submitted_category_name: string | null = null;
	let editTransaction: Transaction | null = null;
	let editHasSubmitted = false;
	let editShouldApplyToSimilarTransactions = true;
	let isNoCategoryOnlyFilterEnabled = false;
	let modal: HTMLElement;

	$: editSimilarTransactions = editTransaction
		? $transactions.filter((t) => isSimilar(t, editTransaction))
		: [];
	$: transactionsToShow = $transactions.filter((t) =>
		isNoCategoryOnlyFilterEnabled ? t.category == null : true
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
	}

	function withoutSelectedCategory(category: Category) {
		return category.name !== editCategory;
	}

	async function assignAutomatically() {
		const allTransactions = await getAllTransactions();
		const updatedTransactions = await Promise.all(
			$transactions
				.filter((t) => t.category == null)
				.map(async (t) => {
					const similar = allTransactions.find((otherT) => isSimilar(t, otherT) && otherT.category);
					if (similar) {
						throw new Error('not implemented on server yet');
						// await assignCategoryTo(t.id, similar.category.id);
						return { id: t.id, category: similar?.category };
					}
					return null;
				})
		);

		// updateCategoriesFor(updatedTransactions);
	}

	function updateCategoriesFor(
		categoryByTransactionIdList: { id: string; category: Category }[]
	): void {
		transactions.set(
			$transactions.map((t) => {
				const updated = categoryByTransactionIdList.find((ut) => ut?.id === t.id);

				if (updated) {
					return { ...t, category: updated.category };
				}

				return t;
			})
		);
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
				updateCategoriesFor([{ id: editTransaction?.id ?? '-1', category }]);
			}
			update();
			resetForm();
		};
	};
</script>

<section>
	{#if $transactions.length > 0}
		<div class="grid">
			<div hidden>
				<button type="button" on:click={assignAutomatically} class="btn btn-outline-secondary my-3"
					>Categorien toewijzen
				</button>
			</div>
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
				{#each transactionsToShow as transaction}
					<tr class="clickable" on:click={() => edit(transaction)}>
						<td class="nowrap">{transaction.date_transaction}</td>
						<td>{transaction.name_other_party}</td>
						<td>{transaction.amount}</td>
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
			</tbody>
		</table>
	</figure>
</section>

<dialog bind:this={modal} on:click={() => edit(editTransaction)} on:keyup={() => {}}>
	{#if editTransaction}
		<article on:click|stopPropagation on:keyup|stopPropagation>
			<header>
				<div style="display: flex; justify-content: space-between">
					<div style="align-self: center">
						<div><strong>{editTransaction.name_other_party}</strong></div>
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
				<p><i>{editTransaction.description}</i></p>
			</header>
			<div>
				<section>
					<!-- TODO: Make similar transactions work -> select each item, sneakely add them to all forms -->
					{#if editSimilarTransactions.length > 0}
						<div>
							{$t('transaction_assign_similar_label', { count: editSimilarTransactions.length })}
						</div>
						<ul class="similar">
							{#each editSimilarTransactions as transaction}
								<li class="fst-italic text-muted">
									<label for={transaction.id}>
										<input id={transaction.id} name="other_transaction_ids" type="checkbox" />
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
						<button
							hidden
							id="submit"
							aria-busy={is_submitting &&
								!$categories.some((c) => c.name === submitted_category_name)}
							type="submit"
							class="btn btn-outline-primary mb-3">Save</button
						>
					</div>
				</form>

				<p>{$t('transaction_assign_select_existing_category')}</p>

				<ul>
					{#each $categories.filter(withoutSelectedCategory) as category}
						<li>
							<form
								method="post"
								use:enhance={handleFormSubmit}
								action="?/assign_category&{toMonthQueryString($date)}"
							>
								<input type="hidden" name="transaction_id" value={editTransaction.id} />
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
	article {
		min-width: 500px;
	}
	ul {
		margin: 0;
		padding: 0;
	}

	.shorten {
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
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

	.amount {
		border-radius: 0.5rem;
		color: white;
		padding: 7px 10px;
		text-align: center;
		font-weight: bold;
	}

	.amount.error {
		background-color: #ff2100;
	}

	.amount.success {
		background-color: #3cba7d;
	}
</style>
