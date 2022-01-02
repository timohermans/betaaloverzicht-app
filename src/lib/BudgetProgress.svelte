<script lang="ts">
	// Note that there are no tests anymore for budget progress
	// Reason: There's little gain right now to test something that's there for eye candy
	import type { CategorySummary } from '$lib/types';
	import { budgetsByCategoryId as budgets } from '$lib/store';
	import Chart from 'chart.js/auto/auto.esm';

	export let summary: CategorySummary;

	let doughnutCanvas: HTMLCanvasElement;
	let chart: Chart;

	$: budget = $budgets[summary?.category.id];
	$: summaryAmount = Math.abs(summary?.amount);
	$: progress = (Math.abs(summary?.amount) / budget?.amount) * 100;

	$: if (doughnutCanvas && summary) {
		if (chart && chart.destroy) chart.destroy();
		chart = renderChart(doughnutCanvas, summaryAmount);
	}

	function renderChart(canvas: HTMLCanvasElement, summaryAmount: number) {
		let backgroundColor = 'rgb(40, 223, 166)';
		if (progress > 75 && progress < 100) {
			backgroundColor = 'rgb(253, 166, 93)';
		} else if (progress >= 100) {
			backgroundColor = 'rgb(247, 96, 9)';
		}

		return new Chart(canvas.getContext('2d'), {
			type: 'doughnut',
			options: {
				cutout: '25%',
				plugins: {
					legend: { display: false },
					tooltip: { enabled: false }
				}
			},
			data: {
				labels: ['spent', 'left'],
				datasets: [
					{
						data: [summary.amount, budget?.amount - (summaryAmount || 0)],
						backgroundColor: [backgroundColor, 'rgb(255, 255, 255)'],
						hoverOffset: 4
					}
				]
			}
		});
	}
</script>

<div>
	<canvas bind:this={doughnutCanvas} height="50" width="50" />
</div>

<style>
	div {
		max-width: 50px;
	}
</style>
