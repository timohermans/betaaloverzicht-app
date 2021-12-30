<script lang="ts">
	import { page } from '$app/stores';
	import { date } from '$lib/store';
	import { onMount } from 'svelte';

	let selectedDate = new Date();

	onMount(() => {
		const year = +$page.query.get('year') || new Date().getFullYear();
		const month = $page.query.has('month') ? +$page.query.get('month') - 1 : new Date().getMonth();
		selectedDate = new Date(year, month, 1);

		if (!$page.query.has('year') || !$page.query.has('month')) {
			date.set(new Date());
		} else {
			date.set(selectedDate);
		}
	});
</script>

<h2>
	{selectedDate.toLocaleDateString()}
</h2>
