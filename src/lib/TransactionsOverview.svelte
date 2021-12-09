<script lang="ts">
	import { onMount } from 'svelte';

	import type { Category, Transaction } from './transaction';
	import { assignCategoryTo, getCategories, getTransactionsOf, upsertCategory } from './api';

	let transactions: Transaction[] = [];
	let categories = [];
	let editId: number = null;
	let editCategory: string = null;
	let editHasSubmitted = false;
	let editShouldApplyToSimilarTransactions = true;
	let isLoading = true;

	$: editTransaction = editId && transactions.find((t) => t.id === editId);
	$: editSimilarTransactions =
		editTransaction && transactions.filter((t) => isSimilar(t, editTransaction));

	onMount(async () => await init());

	async function init() {
		const today = new Date();
		transactions = await getTransactionsOf(today);
		await showCategoriesToAssign();
		isLoading = false;
	}

	function edit(transaction: Transaction) {
		if (editId === transaction.id) return;

		resetForm();
		editId = transaction.id;
		if (transaction.category) editCategory = transaction.category.name;
	}

	function resetForm() {
		editId = null;
		editHasSubmitted = false;
		editCategory = null;
	}

	async function saveCategory(transaction: Transaction, event: Event, name?: string) {
		event.preventDefault();
		editHasSubmitted = true;

		if (name) editCategory = name;

		if (!editCategory) {
			return;
		}

		const category = await upsertCategory(editCategory);
		await assignCategoryTo(transaction.id, category.id);
		transaction.category = category;

		if (editShouldApplyToSimilarTransactions && editSimilarTransactions) {
			for (const similar of editSimilarTransactions) {
				await assignCategoryTo(similar.id, category.id);
				similar.category = category;
			}
		}

		resetForm();
		await init();
	}

	async function showCategoriesToAssign() {
		isLoading = true;
		categories = await getCategories();
		isLoading = false;
	}

	function withoutSelectedCategory(category) {
		return category.name !== editCategory;
	}

	async function assignAutomatically() {
		await Promise.all(
			transactions
				.filter((t) => t.category == null)
				.map(async (t) => {
					const similar = transactions.find((otherT) => isSimilar(t, otherT) && otherT.category);
					if (similar) {
						return await assignCategoryTo(t.id, similar.category.id);
					}
					return null;
				})
		);

		await init();
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

	<!-- TODO: (S) show transactions with conflicting categories when found -->
	<!-- TODO: (S) show a loading indicator and a summary when assigning categories is done-->

	{#if isLoading}
		<p>loading...</p>
	{/if}

	{#if transactions.length > 0}
		<button type="button" on:click={assignAutomatically} class="btn btn-outline-secondary"
			>Categorien toewijzen</button
		>
	{/if}

	<ul>
		{#each transactions as transaction}
			<li class="row mb-3" on:click={() => edit(transaction)}>
				<div class="col-12">{transaction.date_transaction}</div>
				<div class="col-8">{transaction.name_other_party}</div>
				<div class="col-4">{transaction.amount}</div>
				<div class="col-6">{transaction.iban}</div>
				<div class="col-6">{transaction.iban_other_party}</div>
				<div class="col-12">{transaction.description}</div>
				<div class="col">
					{#if editId === transaction.id}
						<form
							on:submit={(event) => saveCategory(transaction, event)}
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
									{#each categories.filter(withoutSelectedCategory) as category}
										<a
											on:click={(event) => saveCategory(transaction, event, category.name)}
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
					{/if}

					{#if editId !== transaction.id && transaction.category}
						<span>{transaction.category.name}</span>
					{/if}

					{#if editId !== transaction.id && !transaction.category}
						<span class="fst-italic">Nog geen categorieen</span>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</section>
