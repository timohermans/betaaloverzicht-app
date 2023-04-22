<script lang="ts">
	import { t } from '$lib/i18n';
	import {
		compute_transaction_summary,
		is_variable_expense,
		split_transactions_by_week,
		to_number
	} from '$lib/transaction';
	import type { Transaction } from '$lib/types';

	export let transactions: Transaction[];
    export let total_income: number;

	const variable_expenses = transactions.filter(is_variable_expense);
	let transactions_by_week = split_transactions_by_week(variable_expenses);
	let summary = compute_transaction_summary(transactions);
</script>

<section>
	<hgroup>
		<h2>{$t('month_statistics_title')}</h2>
		<h3>{$t('month_statistics_subtitle')}</h3>
	</hgroup>

	<ul>
		<li>
			<hgroup>
				<h4>Balans</h4>
				<h5>{(total_income - summary.total_expenses).toFixed(2)}</h5>
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
				<h4>Reserves gebruikt</h4>
				<h5>{summary.total_savings_used.toFixed(2)}</h5>
			</hgroup>
		</li>
	</ul>

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
</section>
