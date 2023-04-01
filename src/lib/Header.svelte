<script lang="ts">
	import { current_user, date } from '$lib/store';
	import { logout } from './auth';

	let previousDate: Date;
	let nextDate: Date;

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
	{#if $current_user}
		<ul>
			<li>
				Hello, {$current_user.name} <a href="#top" on:click={() => logout()}>(logout)</a>
			</li>
		</ul>
	{/if}
</nav>
