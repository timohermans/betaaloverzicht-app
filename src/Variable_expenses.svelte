<script lang="ts">
	import { t } from '$lib/i18n';
	import Badge from './lib/Badge.svelte';
	import { get_week_number } from './lib/transaction';

	export let date: Date;
	export let weekly_budget: number;
	export let summary: {
		prior_actual_income: number;
		prior_fixed_expenses: number;
		total_expenses: number;
		total_savings_used: number;
		total_variable_expenses: number;
		variable_expenses_per_week: { [week: number]: number };
	};

	const this_week = get_week_number(new Date());
	const this_year = new Date().getFullYear();
	const year = date.getFullYear();

	function get_week_status(week: number, spent: number) {
		if (is_good_week(week, spent)) return 'success';
		if (is_bad_week(spent)) return 'danger';
		return 'normal';
	}

	function is_good_week(week: number, spent: number) {
		return is_passed(week) && spent <= weekly_budget;
	}

	function is_bad_week(spent: number) {
		return spent > weekly_budget;
	}

	function is_passed(week: number) {
		return year < this_year || week < this_week;
	}

	function is_current(week: number) {
		return year === this_year && this_week === week;
	}
</script>

<section>
	<hgroup>
		<h2>{$t('month_statistics_title')}</h2>
		<h3>{$t('month_statistics_subtitle')}</h3>
	</hgroup>

	<ul>
		<li>
			<hgroup>
				<h4>Te besteden</h4>
				<h5>{(summary.prior_actual_income + summary.prior_fixed_expenses).toFixed(2)}</h5>
			</hgroup>
		</li>
		<li>
			<hgroup>
				<h4>Uitgegeven</h4>
				<h5>{summary.total_variable_expenses.toFixed(2)}</h5>
			</hgroup>
		</li>
		<li>
			<hgroup>
				<h4>Wat is over?</h4>
				<h5>
					{(
						summary.prior_actual_income +
						summary.prior_fixed_expenses +
						summary.total_variable_expenses
					).toFixed(2)}
				</h5>
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
		{#each Object.keys(summary.variable_expenses_per_week) as week}
			<li>
				<hgroup>
					<h4 class="week">
						<span>{$t('week')} <a href="#week-{week}">{week}</a></span>
						{#if is_current(+week)}
							<span>{' '}👈</span>
						{/if}
					</h4>
					<h5>
						<Badge
							type={get_week_status(+week, Math.abs(summary.variable_expenses_per_week[+week]))}
						>
							{summary.variable_expenses_per_week[+week].toFixed(2)}
						</Badge>
					</h5>
				</hgroup>
			</li>
		{/each}
	</ul>
</section>

<style>
	ul > li {
		list-style-type: none;
	}

	.week {
		margin-bottom: 5px;
	}
</style>
