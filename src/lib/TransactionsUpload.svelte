<script lang="ts">
	// TODO: (S) Refactor to be more svelte-like and use `api.ts` for calls  (with bind:files, |preventDefault, etc.)
	import auth from './auth';
	import { parse } from './transaction';
	import { variables } from './variables';

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

		const auth0 = await auth.createClient();
		const transactions = await parse(file);
		const token = await auth0.getTokenSilently({
			audience: 'http://localhost:2222'
		});

		try {
			await fetch(`${variables.apiUrl}/transactions?on_conflict=code`, {
				method: 'POST',
				body: JSON.stringify(transactions),
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					Prefer: 'resolution=ignore-duplicates'
				}
			});

			message = 'Upload successful!';

			setTimeout(() => {
				reset();
			}, 3000);
		} catch (error) {
			message = "something went wrong I'm afraid :(";
		}
	}

	function reset() {
		form.reset();
		isValid = null;
		message = null;
		isSubmitted = false;
	}

	function validate() {
		isValid = false;
		message = null;
		if (!file) {
			message = 'Please add a file';
		} else if (file.type !== 'text/csv') {
			message = 'Only csv files are supported';
		} else {
			isValid = true;
		}
		isSubmitted = true;
	}
</script>

<section id="app-add-transactions">
	<h2>Nieuwe transacties</h2>
	<form bind:this={form} on:submit={add} class:was-validated={isSubmitted} novalidate>
		<div>
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
