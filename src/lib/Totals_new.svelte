<script lang="ts">
	import type { Transaction } from '$lib/types';
	import { ibans } from './store';
	import { to_number } from './transaction';

	export let transactions: Transaction[];

	$: summary = computeTransactionSummary(transactions, $ibans);

	function computeTransactionSummary(transactions: Transaction[], ibans: string[] = []) {
		const summary = {
			total_income: 0,
			total_expenses: 0,
			total_savings_used: 0,
			total_fixed: 0,
			total_saved: 0
		};
		if (transactions.length === 0) return summary;
		return transactions.reduce((acc, transaction) => {
			const amount = to_number(transaction.amount);

			if (amount > 0 && ibans.some((i) => i === transaction.iban_other_party)) {
				acc.total_savings_used += amount;
			} else if (amount > 0) {
				acc.total_income += amount;
			} else {
				acc.total_expenses += amount;
			}

			if (transaction.authorization_code) {
				acc.total_fixed += amount;
			}

			return acc;
		}, summary);
	}
</script>

<ul>
	<li>Inkomen: {summary.total_income.toFixed(2)}</li>
    <li>Reserves gebruikt: {summary.total_savings_used.toFixed(2)}</li>
	<li>Uitgaven: {summary.total_expenses.toFixed(2)}</li>
	<li>Balans: {(summary.total_expenses + summary.total_income).toFixed(2)}</li>
	<li>Vaste lasten: {summary.total_fixed.toFixed(2)}</li>
	<li>Variabel uitgegeven: {(summary.total_expenses - summary.total_fixed).toFixed(2)}</li>
</ul>
