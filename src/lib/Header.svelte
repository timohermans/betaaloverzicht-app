<script lang="ts">
	import Authentication from '$lib/Authentication.svelte';
	import { date } from '$lib/store';

	let previousDate;
	let nextDate;

	$: if ($date) {
		updateDates($date);
	}

	function updateDates(date: Date) {
		previousDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
	}
</script>

<nav>
	<ul>
		<li>
			<strong>
				Betaaloverzicht
				{#if $date}
					{$date?.getFullYear()}-{$date?.getMonth() + 1}
				{/if}
			</strong>
		</li>
		<li>
			<a
				rel="external"
				href="?year={previousDate?.getFullYear()}&month={previousDate?.getMonth() + 1}">←</a
			>
		</li>
		<li>
			<a rel="external" href="?year={nextDate?.getFullYear()}&month={nextDate?.getMonth() + 1}">→</a
			>
		</li>
	</ul>
	<ul>
		<li>
			<Authentication />
		</li>
	</ul>
</nav>
