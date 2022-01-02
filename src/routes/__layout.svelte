<script lang="ts">
</script>

<main class="container">
	<slot />
</main>

<style lang="scss" global>
	$enable-responsive-spacings: false;
	@import '@picocss/pico/scss/pico';

	.cluster {
		display: flex;
		gap: var(--spacing);
		flex-wrap: wrap;
		padding: calc(var(--spacing) / 2);
	}

	.cluster.one-line {
		flex-wrap: nowrap;
	}
</style>
