<script lang="ts">
	import type { Transaction } from '$lib/types';
	import { t } from './i18n';
	import {
		compute_transaction_summary,
		is_variable_expense,
		split_transactions_by_week
	} from './transaction';

	export let date: Date;
	export let transactions: Transaction[];
	export let ibans: string[];

	const variable_expenses = transactions.filter(is_variable_expense);
	let transactions_by_week = split_transactions_by_week(variable_expenses);
	let summary = compute_transaction_summary(transactions, ibans);

	$: weekly_budget = (
		(summary.total_income + summary.total_fixed) /
		Object.keys(transactions_by_week).length
	).toFixed(2);
</script>

<section>
	<hgroup>
		<h2>{$t('weekly_budget_title')}</h2>
		<h3>{$t('weekly_budget_subtitle')}</h3>
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
				<h4>Vaste lasten</h4>
				<h5>{summary.total_fixed.toFixed(2)}</h5>
			</hgroup>
		</li>
		
		<li>
			<hgroup>
				<h4>{$t('totals_to_use_next_month')}</h4>
				<h5>
					<mark>{weekly_budget}</mark>
				</h5>
			</hgroup>
		</li>
	</ul>
</section>

<style>
	li {
		list-style-type: none;
	}
</style>
