<script lang="ts">
	import type { CategorySummary } from '$lib/types';
	import { budgetsByCategoryId as budgets } from '$lib/store';

	export let summary: CategorySummary;

	$: budget = $budgets[summary?.category.id];
	$: progress = (Math.abs(summary?.amount) / budget?.amount) * 100;
</script>

<progress min="0" max="100" value={progress || 0} />
