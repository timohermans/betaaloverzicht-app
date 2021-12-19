<script lang="ts">
	import { upsertBudget } from '$lib/api';
	import type { Category } from '$lib/transaction';
	import { budgetsByCategoryId } from '$lib/store';

	export let category: Category;
	export let date: Date;

	$: budget = $budgetsByCategoryId[category.id];
	$: value = budget?.amount.toString();

	let isEditing = false;

	async function saveBudget() {
		if (value == null || value === '') return;
		const budgetDate = new Date(date.getFullYear(), date.getMonth(), 1);

		const budget = await upsertBudget(category.id, +value, budgetDate);

		budgetsByCategoryId.set({
			...$budgetsByCategoryId,
			[category.id]: budget
		});

		isEditing = false;
	}
</script>

{#if !isEditing}
	<div on:click={() => (isEditing = true)}>{budget?.amount || 0}</div>
{:else}
	<div>
		<form on:submit|preventDefault={saveBudget}>
			<input type="number" placeholder="Wat is je budget?" bind:value />
		</form>
	</div>
{/if}
