<script lang="ts">
	export let date: Date;
	export let user: { name: string; id: string };
	let previousDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
	let nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
</script>

<nav class="container-fluid">
	<ul>
		<li>
			<strong>
				Betaaloverzicht
				{#if date}
					{date?.getFullYear()}-{date?.getMonth() + 1}
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
	{#if user.id}
		<ul>
			<li>
				Hello, {user.name} <a href="/logout">(logout)</a>
			</li>
		</ul>
	{/if}
</nav>
