<script lang="ts">
	import { saveTransactions } from './api';
	import { parse } from './transaction';

	// TODO: (M) Refactor to be more svelte-like and use `api.ts` for calls  (with bind:files, |preventDefault, etc.)

	export let onTransactionsUploaded: () => void = null;

	let isSubmitted = false;
	let isValid = false;
	let message: string = null;
	let form: HTMLFormElement;
	let file: File = null;

	function onFileChange(event: Event) {
		if (!(event.target instanceof HTMLInputElement)) return;

		file = event.target.files[0];
		validate();
		event.target.setCustomValidity(isValid ? '' : message);
	}

	async function add(event: Event) {
		event.preventDefault();
		validate();

		if (!isValid) {
			return;
		}

		const transactions = await parse(file);

		await saveTransactions(transactions);

		message = 'Transacties opgeslagen!';

		onTransactionsUploaded();

		setTimeout(() => {
			reset();
		}, 3000);
	}

	function reset() {
		form.reset();
		isValid = null;
		message = null;
		isSubmitted = false;
	}

	function validate() {
		const supportedTypes = ['application/vnd.ms-excel', 'text/csv'];
		isValid = false;
		message = null;
		if (!file) {
			message = 'Please add a file';
		} else if (!supportedTypes.includes(file.type)) {
			message = 'Only csv files are supported';
		} else {
			isValid = true;
		}
		isSubmitted = true;
	}
</script>

<section id="app-add-transactions">
	<!-- <h2>Nieuwe transacties</h2> -->
	<form
		bind:this={form}
		on:submit|preventDefault={add}
		class:was-validated={isSubmitted}
		novalidate
	>
		<div>
			<label for="file">Nieuwe transacties</label>
			<input
				class="form-control"
				id="file"
				type="file"
				on:change={onFileChange}
				accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
				required
			/>
			{#if message && !isValid}
				<div class="invalid-feedback">{message}</div>
			{/if}
			{#if message && isValid}
				<div class="valid-feedback">{message}</div>
			{/if}
		</div>
		<div class="mt-3">
			<button type="submit" class="btn btn-primary">Voeg toe</button>
		</div>
	</form>
</section>
