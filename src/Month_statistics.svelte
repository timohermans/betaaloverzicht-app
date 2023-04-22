<script lang="ts">
	import { t } from '$lib/i18n';
	import Badge from './lib/Badge.svelte';
	import { get_week_number } from './lib/transaction';

	export let weekly_budget: number;
	export let summary: {
		total_income: number;
		total_expenses: number;
		total_savings_used: number;
		variable_expenses_per_week: { [week: number]: number };
	};

	const this_week = get_week_number(new Date());

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
		return week < this_week;
	}

	function is_current(week: number) {
		return this_week === week;
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
				<h4>Balans</h4>
				<h5>{(summary.total_income + summary.total_expenses).toFixed(2)}</h5>
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
		{#each Object.keys(summary.variable_expenses_per_week) as week}
			<li>
				<hgroup>
					<h4 class="week">
						<span>{$t('week')} {week}</span>
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
