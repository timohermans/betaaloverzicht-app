<script lang="ts">
	import { date } from '$lib/store';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';

	let selectedDate = null;

	onMount(() => {
		const qs = browser ? document.location.search : '';
		const query = new URLSearchParams(qs);

		const year = query.has('year') ? +query.get('year')! : new Date().getFullYear();
		const month = query.has('month') ? +query.get('month')! - 1 : new Date().getMonth();
		selectedDate = new Date(year, month, 1);

		if (!query.has('year') || !query.has('month')) {
			date.set(new Date());
		} else {
			date.set(selectedDate);
		}
	});
</script>
