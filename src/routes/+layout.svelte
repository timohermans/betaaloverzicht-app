<script lang="ts">
	import MonthPicker from '$lib/MonthPicker.svelte';
	import Header from '$lib/Header.svelte';
	import type { PageServerData } from './$types';
	import { date } from '$lib/store';

	export let data: PageServerData;

	date.set(data.date);
</script>

<Header user={data.user} date={data.date} />
<MonthPicker />

<slot />
