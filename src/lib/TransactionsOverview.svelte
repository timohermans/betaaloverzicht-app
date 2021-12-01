<script lang="ts">
	import { onMount } from 'svelte';

	import auth from './auth';

	import type { Transaction } from './transaction';
	import type { Auth0Client } from '@auth0/auth0-spa-js';

	let auth0: Auth0Client = null;
	let transactions = [];
	let editId: number = null;
	let editCategory: string = null;
	let editHasSubmitted = false;

	onMount(async () => await init());

	async function init() {
		auth0 = await auth.createClient();

		const today = new Date();
		const start = new Date(today.getFullYear(), today.getMonth(), 1);
		const end = new Date(start);
		end.setMonth(end.getMonth() + 1);
		end.setDate(end.getDate() - 1);
		const toShortDate = (date: Date) =>
			`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

		const response = await fetch(
			`http://localhost:2222/transactions?date_transaction=gte.${toShortDate(
				start
			)}&date_transaction=lte.${toShortDate(
				end
			)}&order=date_transaction&select=*,category:categories(id,name)`,
			await auth.getAuthFetchConfig(auth0)
		);

		transactions = await response.json();
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

		const authConfig = await auth.getAuthFetchConfig(auth0);
		const categoryResult = await fetch(`http://localhost:2222/categories?on_conflict=name`, {
			headers: {
				...authConfig.headers,
				Prefer: 'return=representation,resolution=merge-duplicates',
				Accept: 'application/vnd.pgrst.object+json'
			},
			method: 'POST',
			body: JSON.stringify({ name: editCategory })
		});
		const category = await categoryResult.json();

		await fetch(`http://localhost:2222/transactions?id=eq.${transaction.id}`, {
			...authConfig,
			method: 'PATCH',
			body: JSON.stringify({ category_id: category.id })
		});

		transaction.category = category;
		resetForm();
		await init();
	}
</script>

<section>
	<h2>Transactieoverzicht</h2>
	{#each transactions as transaction}
		<div class="row mb-3" on:click={() => edit(transaction)}>
			<div class="col-12">{transaction.date_transaction}</div>
			<div class="col-8">{transaction.name_other_party}</div>
			<div class="col-4">{transaction.amount}</div>
			<div class="col-6">{transaction.iban}</div>
			<div class="col-6">{transaction.iban_other_party}</div>
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
						</div>
						<div class="col-3">
							<button type="submit" class="btn btn-outline-primary mb-3"> Save </button>
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
		</div>
	{/each}
</section>
