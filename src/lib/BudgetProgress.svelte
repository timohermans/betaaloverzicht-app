<script lang="ts">
	import type { CategorySummary } from '$lib/types';
	import Chart from 'chart.js/auto';

	export let summary: CategorySummary;
	export let total_expenses: number;
	export let total_income: number;

	let doughnutCanvas: HTMLCanvasElement;
	let chart: Chart<'doughnut', number[], string> | null;

	$: summaryAmount = summary?.amount ?? 0;
	$: progress =
		(Math.abs(summary?.amount) / Math.abs(summary?.amount > 0 ? total_income : total_expenses)) *
		100;

	$: if (doughnutCanvas && summary) {
		if (chart && chart.destroy) chart.destroy();
		chart = renderChart(doughnutCanvas, summaryAmount);
	}

	function renderChart(canvas: HTMLCanvasElement, summaryAmount: number) {
		const green = 'rgb(40, 223, 166)';
		const orange = 'rgb(253, 166, 93)';
		const red = 'rgb(247, 96, 9)';

		let backgroundColor = green;
		let total_excluding_amount = 0;

		if (summaryAmount > 0) {
			backgroundColor = green;
			total_excluding_amount = total_income - summaryAmount;
		} else {
			backgroundColor = progress < 25 ? orange : red;
			total_excluding_amount = total_expenses * -1 - summaryAmount * -1;
		}

		const context = canvas.getContext('2d');
		if (!context) return null;
		return new Chart(context, {
			type: 'doughnut',
			options: {
				cutout: '25%',
				plugins: {
					legend: { display: false },
					tooltip: { enabled: false }
				}
			},
			data: {
				labels: ['category', 'rest'],
				datasets: [
					{
						data: [progress > 5 ? summary.amount : total_excluding_amount * 0.05, total_excluding_amount < 0 ? 0 : total_excluding_amount],
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
