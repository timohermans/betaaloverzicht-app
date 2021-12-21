<script lang="ts">
	import { upsertBudget } from '$lib/api';
	import type { Budget, Category } from '$lib/types';
	import { budgetsByCategoryId } from '$lib/store';

	export let category: Category;
	export let date: Date;

	$: budget = $budgetsByCategoryId[category.id];
	$: if (budget) updateValueWith(budget);
	const updateValueWith = (budget: Budget) => (value = budget.amount);

	let value;
	let isEditing = false;
	let input: HTMLInputElement;

	$: if (isEditing && input) input.focus();

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
	<div on:click|preventDefault={() => (isEditing = true)}>{budget?.amount || 0}</div>
{:else}
	<div>
		<form on:submit|preventDefault={saveBudget}>
			<input
				bind:this={input}
				on:blur={() => (isEditing = false)}
				type="number"
				placeholder="Wat is je budget?"
				bind:value
			/>
		</form>
	</div>
{/if}
