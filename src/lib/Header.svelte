<script lang="ts">
	import Authentication from '$lib/Authentication.svelte';
	import { date } from '$lib/store';
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
	</ul>
	<ul>
		<li>
			<Authentication />
		</li>
	</ul>
</nav>
