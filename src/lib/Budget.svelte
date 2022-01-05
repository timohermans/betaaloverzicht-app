<script lang="ts">
	import { upsertBudget } from '$lib/api';
	import type { Budget, CategorySummary } from '$lib/types';
	import { date, budgetsByCategoryId } from '$lib/store';

	export let summary: CategorySummary;

	$: budget = $budgetsByCategoryId[summary?.category.id];
	$: if (budget) updateValueWith(budget);
	const updateValueWith = (budget: Budget) => (value = budget.amount);

	let value;
	let isEditing = false;
	let input: HTMLInputElement;

	$: if (isEditing && input) input.focus();

	async function saveBudget() {
		if (value == null || value === '') return;
		const budgetDate = new Date($date.getFullYear(), $date.getMonth(), 1);

		const budget = await upsertBudget(summary?.category.id, +value, budgetDate);

		budgetsByCategoryId.set({
			...$budgetsByCategoryId,
			[summary?.category.id]: budget
		});

		isEditing = false;
	}
</script>

{#if !isEditing}
	<div class="clickable" role="button" on:click|preventDefault={() => (isEditing = true)}>
		<span>{Math.abs(summary?.amount).toFixed(2)}</span>
		{#if budget?.amount}
			<span>/</span>
			<span>{budget?.amount}</span>
		{/if}
	</div>
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
