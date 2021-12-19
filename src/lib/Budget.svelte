<script lang="ts">
	import type { Category } from './transaction';

	export let category: Category;

	let isEditing = false;
	let value;
</script>

<div on:click={() => (isEditing = true)}>0</div>

{#if isEditing}
	<div>
		<input type="number" placeholder="Wat is je budget?" bind:value />
	</div>
{/if}
