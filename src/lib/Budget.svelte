<script lang="ts">
	import type { Budget, CategorySummary } from '$lib/types';
	import { date, budgetsByCategoryId } from '$lib/store';

	export let summary: CategorySummary;

	$: budget = $budgetsByCategoryId[summary?.category.id];
	$: if (budget) updateValueWith(budget);
	const updateValueWith = (budget: Budget) => (value = budget.amount.toString());

	let value: string;
	let isEditing = false;
	let input: HTMLInputElement;

	$: if (isEditing && input) input.focus();

	async function saveBudget() {
		if (value == null || value === '') return;
		const budgetDate = new Date($date.getFullYear(), $date.getMonth(), 1);

		throw new Error('deprecated. Remove!');
		// const budget = await upsertBudget(summary?.category.id, +value, budgetDate);

		budgetsByCategoryId.set({
			...$budgetsByCategoryId,
			[summary?.category.id]: budget
		});

		isEditing = false;
	}

	function startEditing() {
		isEditing = true;
	}
</script>

{#if !isEditing}
	<div
		class="clickable"
		on:keyup|preventDefault={startEditing}
		on:click|preventDefault={startEditing}
	>
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
			<button type="submit" hidden>Ok</button>
		</form>
	</div>
{/if}

<style>
	.clickable {
		cursor: pointer;
	}
</style>