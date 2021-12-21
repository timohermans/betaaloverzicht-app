<script lang="ts">
	import { transactions } from '$lib/store';

	let incomes = 0;
	let expenses = 0;

	$: if ($transactions.length > 0) {
		incomes = 0;
		expenses = 0;
		$transactions?.forEach((t) => {
			const amount = +t.amount.replace(',', '.');

			if (amount < 0) {
				expenses += amount;
			} else {
				incomes += amount;
			}
		});
	}
</script>

<div class="row">
	<div class="col">Totaal binnengekomen</div>
	<div class="col text-end">{incomes.toFixed(2)}</div>
</div>

<div class="row">
	<div class="col">Totaal uitgegeven</div>
	<div class="col text-end">{expenses.toFixed(2)}</div>
</div>

<style>
	.col {
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
		border: 1px solid rgba(39, 41, 43, 0.1);
	}
</style>
