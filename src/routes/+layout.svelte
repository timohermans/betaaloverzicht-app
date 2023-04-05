<script lang="ts">
	import Header from '$lib/Header.svelte';
	import type { PageServerData } from './$types';
	import { date } from '$lib/store';

	export let data: PageServerData;

	date.set(data.date);
</script>

<svelte:head>
	<link rel="stylesheet" href="/assets/pico.min.css">
</svelte:head>

<Header user={data.user} date={data.date} />

<slot />
