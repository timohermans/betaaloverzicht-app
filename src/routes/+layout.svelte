<script lang="ts">
	import MonthPicker from '$lib/MonthPicker.svelte';
	import Header from '$lib/Header.svelte';
	import type { PageServerData } from './$types';
	import { date } from '$lib/store';
	import pico from '@picocss/pico/css/pico.min.css?url';

	export let data: PageServerData;

	date.set(data.date);
</script>

<svelte:head>
	<link rel="stylesheet" href={pico}>
</svelte:head>

<Header user={data.user} date={data.date} />
<MonthPicker />

<slot />
