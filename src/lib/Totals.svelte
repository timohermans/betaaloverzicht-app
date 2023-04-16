<script lang="ts">
	import type { Transaction } from '$lib/types';
	import { t } from './i18n';
	import { split_transactions_by_week, to_number } from './transaction';

	export let date: Date;
	export let transactions: Transaction[];
	export let ibans: string[];

	let summary = computeTransactionSummary(transactions, ibans);
	const expenses_not_fixed = transactions.filter(
		(t) => t.amount.startsWith('-') && !t.authorization_code
	);
	let transactions_by_week = split_transactions_by_week(expenses_not_fixed);

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

			if (
				transaction.authorization_code ||
				(amount < 0 && ibans.some((i) => i === transaction.iban_other_party))
			) {
				acc.total_fixed += amount;
			}

			return acc;
		}, summary);
	}
</script>

<hgroup>
	<h1>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</h1>
	<h2>Deze maand: {(summary.total_expenses + summary.total_income).toFixed(2)}</h2>
</hgroup>
<ul>
	<li>
		<hgroup>
			<h4>Inkomen</h4>
			<h5>{summary.total_income.toFixed(2)}</h5>
		</hgroup>
	</li>

	<li>
		<hgroup>
			<h4>Uitgaven</h4>
			<h5>{summary.total_expenses.toFixed(2)}</h5>
		</hgroup>
	</li>
	<li>
		<hgroup>
			<h4>Vaste lasten</h4>
			<h5>{summary.total_fixed.toFixed(2)}</h5>
		</hgroup>
	</li>
	<li>
		<hgroup>
			<h4>Reserves gebruikt</h4>
			<h5>{summary.total_savings_used.toFixed(2)}</h5>
		</hgroup>
	</li>
	<li>
		<hgroup>
			<h4>{$t('totals_to_use_next_month')}</h4>
			<h5>
				<mark
					>{(
						(summary.total_income + summary.total_fixed) /
						Object.keys(transactions_by_week).length
					).toFixed(2)}</mark
				>
			</h5>
		</hgroup>
	</li>
</ul>
<hr />
<hgroup>
	<h2>Variabel</h2>
	<h3>Uitgegeven: {(summary.total_expenses - summary.total_fixed).toFixed(2)}</h3>
</hgroup>
<ul>
	{#each Object.keys(transactions_by_week) as week}
		<li>
			<hgroup>
				<h4>{$t('week')} {week}</h4>
				<h5>
					{transactions_by_week[+week]
						.reduce((acc, t) => (acc += to_number(t.amount)), 0)
						.toFixed(2)}
				</h5>
			</hgroup>
		</li>
	{/each}
</ul>
<hr />

<style>
	li {
		list-style-type: none;
	}
</style>
