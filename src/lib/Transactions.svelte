<script lang="ts">
	import type { Category, Transaction } from '$lib/types';
	import { assignCategoryTo, getAllTransactions, upsertCategory } from '$lib/api';
	import { transactions, categories } from '$lib/store';

	// TODO: (S) show a loading indicator and a summary when assigning categories is done
	// TODO: (M) show transactions with conflicting categories when found

	let editId: number = null;
	let editCategory: string = null;
	let editHasSubmitted = false;
	let editShouldApplyToSimilarTransactions = true;
	let isNoCategoryOnlyFilterEnabled = false;

	$: editTransaction = editId && $transactions.find((t) => t.id === editId);
	$: editSimilarTransactions =
		editTransaction && $transactions.filter((t) => isSimilar(t, editTransaction));
	$: transactionsToShow = $transactions.filter((t) =>
		isNoCategoryOnlyFilterEnabled ? t.category == null : true
	);

	function edit(transaction: Transaction) {
		if (editId === transaction.id) {
			resetForm();
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
			categories.set([...$categories, category].sort((c1, c2) => (c1.name > c2.name ? 1 : -1)));
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
			...(editShouldApplyToSimilarTransactions && editSimilarTransactions
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
	{#if $transactions.length > 0}
		<div class="grid">
			<div>
				<button type="button" on:click={assignAutomatically} class="btn btn-outline-secondary my-3"
					>Categorien toewijzen
				</button>
			</div>
			<div>
				<div class="form-check">
					<input
						bind:checked={isNoCategoryOnlyFilterEnabled}
						type="checkbox"
						class="form-check-input"
						id="filterNoCategory"
					/>
					<label for="filterNoCategory" class="form-check-label">zonder categorie</label>
				</div>
			</div>
		</div>
	{/if}

	<figure>
		<table>
			<tbody>
				{#each transactionsToShow as transaction}
					<tr
						class="clickable"
						on:click={() => edit(transaction)}
						on:touchend={() => edit(transaction)}
					>
						<td class="nowrap">{transaction.date_transaction}</td>
						<td>{transaction.name_other_party}</td>
						<td>{transaction.amount}</td>
						<td>
							{#if transaction.category}
								<span>{transaction.category.name}</span>
							{/if}

							{#if editId !== transaction.id && !transaction.category}
								<span class="fst-italic">Nog geen categorieen</span>
							{/if}
						</td>
						<td>{transaction.iban}</td>
						<td class="col-12 col-xl-4 nowrap">{transaction.description}</td>
						{#if editId === transaction.id}
							<dialog open>
								<article on:click|stopPropagation>
									<header>{transaction.name_other_party} {transaction.amount}</header>
									<div>
										<form
											on:submit|preventDefault={() => saveCategory(transaction)}
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

												<div class="cluster">
													{#each $categories.filter(withoutSelectedCategory) as category}
														<a
															on:click|preventDefault={() => saveCategory(transaction, category)}
															href="/#"
															role="button"
															class="list-group-item list-group-item-action">{category.name}</a
														>
													{/each}
												</div>
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
								</article>
							</dialog>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</figure>
</section>

<style>
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
</style>
