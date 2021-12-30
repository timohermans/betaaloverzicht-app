<script lang="ts">
	import { page } from '$app/stores';
	import { date } from '$lib/store';

	$: year = +$page.query.get('year') || new Date().getFullYear();
	$: month = $page.query.has('month') ? +$page.query.get('month') - 1 : new Date().getMonth();
	$: selectedDate = new Date(year, month, 1);

	$: {
		console.log(year);
		console.log(month);
		console.log(selectedDate);
		if (!$page.query.has('year') || !$page.query.has('month')) {
			date.set(new Date());
		} else {
			date.set(selectedDate);
		}
	}
</script>

<h2>
	{selectedDate.toLocaleDateString()}
</h2>
