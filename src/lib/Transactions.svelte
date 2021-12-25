<script lang="ts">
	import type { Category, Transaction } from '$lib/types';
	import { assignCategoryTo, getAllTransactions, upsertCategory } from '$lib/api';
	import { transactions, categories } from '$lib/store';

	// TODO: (L) Update the $categories list when a new category is added
	// TODO: (S) show a loading indicator and a summary when assigning categories is done
	// TODO: (L) Show only no category
	// TODO: (M) show transactions with conflicting categories when found
	// TODO: (L) Think of something to "invert" a transaction (from "eigen rekening")

	let editId: number = null;
	let editCategory: string = null;
	let editHasSubmitted = false;
	let editShouldApplyToSimilarTransactions = true;

	$: editTransaction = editId && $transactions.find((t) => t.id === editId);
	$: editSimilarTransactions =
		editTransaction && $transactions.filter((t) => isSimilar(t, editTransaction));

	function edit(transaction: Transaction) {
		if (editId === transaction.id) {
			editId = null;
			return;
		}

		resetForm();
		editId = transaction.id;
		if (transaction.category) editCategory = transaction.category.name;
	}

	function resetForm() {
		editId = null;
		editHasSubmitted = false;
		editCategory = null;
	}

	async function saveCategory(transaction: Transaction, category?: Category) {
		editHasSubmitted = true;

		if (category) editCategory = category.name;

		if (!editCategory) {
			return;
		}

		if (!category) {
			category = await upsertCategory(editCategory);
		}

		await assignCategoryTo(transaction.id, category.id);

		if (editShouldApplyToSimilarTransactions && editSimilarTransactions) {
			for (const similar of editSimilarTransactions) {
				await assignCategoryTo(similar.id, category.id);
				similar.category = category;
			}
		}

		const transactionsUpdated = [
			{ id: transaction.id, category },
			...(editShouldApplyToSimilarTransactions
				? editSimilarTransactions.map((st) => ({ id: st.id, category }))
				: [])
		];

		resetForm();
		updateCategoriesFor(transactionsUpdated);
	}

	function withoutSelectedCategory(category) {
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
						await assignCategoryTo(t.id, similar.category.id);
						return { id: t.id, category: similar.category };
					}
					return null;
				})
		);

		updateCategoriesFor(updatedTransactions);
	}

	function updateCategoriesFor(
		categoryByTransactionIdList: { id: number; category: Category }[]
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

	function isSimilar(t: Transaction, otherT: Transaction): boolean {
		return (
			t.id !== otherT.id &&
			t.name_other_party.toLowerCase() === otherT.name_other_party.toLowerCase() &&
			t.category == null
		);
	}
</script>

<section>
	<h2>Transactieoverzicht</h2>

	{#if $transactions.length > 0}
		<button type="button" on:click={assignAutomatically} class="btn btn-outline-secondary my-3"
			>Categorien toewijzen
		</button>
	{/if}

	<ul>
		{#each $transactions as transaction}
			<li class="row mb-3" on:click={() => edit(transaction)}>
				<div class="col-4 col-lg-2 col-xl-1 shorten">{transaction.date_transaction}</div>
				<div class="col-8 col-sm-6 col-lg-4 col-xl-2 shorten">{transaction.name_other_party}</div>
				<div class="col-4 col-sm-2 col-lg-2 col-xl-1 text-end">{transaction.amount}</div>
				<div class="col-8 col-sm-6 col-lg-2 col-xl-2 shorten">{transaction.iban}</div>
				<div class="col-12 col-sm-6 col-lg-2 col-xl-2">
					{#if transaction.category}
						<span>{transaction.category.name}</span>
					{/if}

					{#if editId !== transaction.id && !transaction.category}
						<span class="fst-italic">Nog geen categorieen</span>
					{/if}
				</div>
				<div class="col-12 col-xl-4">{transaction.description}</div>

				{#if editId === transaction.id}
					<div class="col-12">
						<form
							on:submit|preventDefault={() => saveCategory(transaction)}
							class="row"
							class:was-validated={editHasSubmitted}
							novalidate
						>
							<div class="col">
								<label for="category">Categorie toevoegen</label>
								<input
									id="category"
									class="form-control"
									type="text"
									placeholder="Vervoer, vaste lasten, etc.."
									bind:value={editCategory}
									required
								/>

								<ul class="list-group">
									{#each $categories.filter(withoutSelectedCategory) as category}
										<a
											on:click|preventDefault={() => saveCategory(transaction, category)}
											href="/#"
											class="list-group-item list-group-item-action">{category.name}</a
										>
									{/each}
								</ul>
							</div>
							<div class="col-3">
								<div class="d-flex flex-column">
									<label for="submit">&nbsp;</label>
									<button id="submit" type="submit" class="btn btn-outline-primary mb-3">
										Save
									</button>
									{#if editSimilarTransactions.length > 0}
										<div class="form-check">
											<input
												bind:checked={editShouldApplyToSimilarTransactions}
												type="checkbox"
												class="form-check-input"
												id="applyAll"
											/>
											<label for="applyAll" class="form-check-label"
												>en {editSimilarTransactions.length} andere(n)</label
											>
										</div>
										<ul>
											{#each editSimilarTransactions as transaction}
												<li class="fst-italic text-muted">
													{transaction.amount} - {transaction.description}
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							</div>
						</form>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	ul {
		margin: 0;
		padding: 0;
	}

	.row > * {
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
		border: 1px solid rgba(39, 41, 43, 0.1);
	}

	.shorten {
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
	}
</style>
