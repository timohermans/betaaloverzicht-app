<script lang="ts">
	import { date } from '$lib/store';
	import type { ActionData } from '../routes/$types';
	import { toMonthQueryString } from './utils/dates';

	export let form: ActionData;

	let is_submitting = false;
</script>

<section id="app-add-transactions">
	<form
		action="?/transactions_file_upload&{toMonthQueryString($date)}"
		method="post"
		novalidate
		enctype="multipart/form-data"
	>
		{#if form?.invalid}<p class="error">Verkeerde file. Probeer een csv bestand 💪.</p>{/if}
		{#if form?.missing}<p class="error">Vergeten een file te selecteren? 👀</p>{/if}
		<div>
			<label for="file">Nieuwe transacties</label>
			<input
				class="form-control"
				id="file"
				type="file"
				name="file"
				accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
				required
			/>
		</div>
		<div class="mt-3">
			<button
				type="submit"
				class="btn btn-primary"
				aria-busy={is_submitting}
				on:click={() => (is_submitting = true)}>Voeg toe</button
			>
		</div>
	</form>
</section>
