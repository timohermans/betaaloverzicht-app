<script lang="ts">
	import Header from '$lib/Header.svelte';
	import { isAuthenticated } from '../lib/store';
	import TransactionsDetails from '../lib/TransactionsDetails.svelte';
	import TransactionsOverview from '../lib/TransactionsOverview.svelte';
	import TransactionsUpload from '../lib/TransactionsUpload.svelte';
</script>

<Header />

<h1>Betaaloverzicht</h1>

{#if !$isAuthenticated}
	<p>Met deze applicatie kun je makkelijk je Rabobank betalingen overzien :)</p>
{:else}
	<TransactionsUpload />

	<!-- TODO: (L) Overview -->
	<section class="mt-3">
		<h2>Overzicht</h2>
	</section>

	<!-- TODO: (L) Details -->
	<section>
		<h2>Details</h2>
		<TransactionsDetails />
	</section>

	<TransactionsOverview />
{/if}
