<script lang="ts">
	import { t } from './i18n';

	export let prior_income: number;
	export let prior_fixed: number;
	export let weekly_budget: number;
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
				<h5>{prior_income.toFixed(2)}</h5>
			</hgroup>
		</li>
		<li>
			<hgroup>
				<h4>Vaste lasten</h4>
				<h5>{prior_fixed.toFixed(2)}</h5>
			</hgroup>
		</li>

		<li>
			<hgroup>
				<h4>{$t('totals_to_use_next_month')}</h4>
				<h5>
					<mark>{weekly_budget.toFixed(0)}</mark>
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
