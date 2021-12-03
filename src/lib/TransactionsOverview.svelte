<script lang="ts">
	import { onMount } from 'svelte';

	import auth from './auth';

	import type { Category, Transaction } from './transaction';
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import { assign } from 'svelte/internal';
	import { assignCategoryTo, getTransactionsOf, upsertCategory } from './api';

	let auth0: Auth0Client = null;
	let transactions = [];
	let editId: number = null;
	let editCategory: string = null;
	let editHasSubmitted = false;
	let isLoading = true;

	onMount(async () => await init());

	async function init() {
		auth0 = await auth.createClient();

		const today = new Date();
		transactions = await getTransactionsOf(today, auth0);
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

	async function saveCategory(transaction: Transaction, event: Event) {
		event.preventDefault();
		editHasSubmitted = true;

		if (!editCategory) {
			return;
		}

		const category = await upsertCategory(editCategory, auth0);
		await assignCategoryTo(transaction, category, auth0);

		transaction.category = category;
		resetForm();
		await init();
	}
</script>

<section>
	<h2>Transactieoverzicht</h2>

	<!-- TODO: (XL) Add button to assign categories automatically -->
	<!-- TODO: (S) show transactions with conflicting categories when found -->

	{#if isLoading}
		<p>loading...</p>
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
								<input
									class="form-control"
									type="text"
									placeholder="Vervoer, vaste lasten, etc.."
									bind:value={editCategory}
									required
								/>

								<!-- TODO: (L) Show previously used categories -->
							</div>
							<div class="col-3">
								<button type="submit" class="btn btn-outline-primary mb-3"> Save </button>
								<!-- TODO: (M) Add button to persist category to multiple categories -->
							</div>
						</form>
					{/if}

					{#if editId !== transaction.id && transaction.category}
						<span>{transaction.category.name}</span>
					{/if}

					{#if editId !== transaction.id && !transaction.category}
						<span class="fst-italic">No category yet</span>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</section>
