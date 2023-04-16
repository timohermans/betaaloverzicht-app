<script lang="ts">
	import { date } from '$lib/store';
	import { to_number } from './transaction';
	import Chart from 'chart.js/auto';
	import type { Transaction } from './types';

	export let ibans: string[];
	export let transactions: Transaction[];

	let incomes = 0;
	let real_incomes = 0;
	let expenses = 0;
	let real_balance = 0;
	let balance = 0;
	let incomesChart: Chart;
	let expensesChart: Chart;
	let balanceChart: Chart;
	let incomesChartData: number[] = [];
	let realIncomesChartData: number[] = [];
	let expensesChartData: number[] = [];
	let balanceChartData: number[] = [];
	let chartLabels: string[] = [];

	let incomeCanvas: HTMLCanvasElement;
	let expensesCanvas: HTMLCanvasElement;
	let balanceCanvas: HTMLCanvasElement;

	$: if (transactions.length > 0 && $date != null && incomeCanvas) {
		incomes = 0;
		real_incomes = 0;
		expenses = 0;

		const finalDay = new Date($date.getFullYear(), $date.getMonth() + 1, -1).getDate();
		for (let i = 0; i < finalDay; i++) {
			incomesChartData[i] = 0;
			realIncomesChartData[i] = 0;
			expensesChartData[i] = 0;
			balanceChartData[i] = 0;
			chartLabels[i] = (i + 1).toString();
		}

		transactions?.forEach((t) => {
			const amount = to_number(t.amount);
			const dayIndex = new Date(t.date_transaction).getDate();

			if (amount < 0) {
				expenses += amount;

				for (let i = dayIndex; i < finalDay; i++) {
					expensesChartData[i] += amount;
				}
			} else {
				incomes += amount;

				if (!ibans.some((i) => i === (t.iban_other_party ?? ''))) {
					real_incomes += amount;
					for (let i = dayIndex; i < finalDay; i++) {
						realIncomesChartData[i] += amount;
					}
				}

				for (let i = dayIndex; i < finalDay; i++) {
					incomesChartData[i] += amount;
				}
			}

			for (let i = dayIndex; i < finalDay; i++) {
				balanceChartData[i] += amount;
			}
		});

		real_balance = real_incomes - Math.abs(expenses);
		balance = incomes - Math.abs(expenses);

		destroyPreviousCharts();
		incomesChart = renderChart(
			incomeCanvas,
			realIncomesChartData,
			'rgb(255, 255, 255)',
			incomesChartData
		);
		expensesChart = renderChart(expensesCanvas, expensesChartData, 'rgb(255, 255, 255)');
		balanceChart = renderChart(balanceCanvas, balanceChartData, 'rgb(255, 255, 255)');
	}

	function destroyPreviousCharts() {
		if (incomesChart) incomesChart.destroy();
		if (expensesChart) expensesChart.destroy();
		if (balanceChart) balanceChart.destroy();
	}

	function renderChart(
		canvas: HTMLCanvasElement,
		data: number[],
		borderColor: string,
		other_data?: number[]
	) {
		return new Chart(canvas.getContext('2d'), {
			type: 'line',
			options: {
				plugins: {
					legend: { display: false }
				},
				elements: {
					point: {
						radius: 0.1,
						hitRadius: 10
					}
				},
				scales: {
					x: { display: false },
					y: { display: false }
				}
			},
			data: {
				labels: chartLabels,
				datasets: [
					{
						data,
						borderColor,
						tension: 0.5
					},
					other_data && {
						data: other_data,
						borderColor: 'rgba(255, 255, 255, 0.5)',
						tension: 0.5
					}
				].filter(Boolean)
			}
		});
	}
</script>

<svelte:head>
	<meta name="theme-color" content={balance < 0 ? '#F76060' : '#28dfa6'} />
</svelte:head>

<div class="grid">
	<article class="incomes">
		<span>Inkomsten</span>
		<canvas id="mychart" bind:this={incomeCanvas} height="150" />
		<center>{real_incomes.toFixed(2)} ({incomes.toFixed(2)})</center>
	</article>

	<article class="expenses">
		<span>Uitgaven</span>
		<canvas bind:this={expensesCanvas} height="150" />
		<center>{expenses.toFixed(2)}</center>
	</article>

	<article class:expenses={real_balance < 0} class:incomes={real_balance >= 0}>
		<span>Balans</span>
		<canvas bind:this={balanceCanvas} height="150" />
		<center>{real_balance.toFixed(2)} ({balance.toFixed(2)})</center>
	</article>
</div>

<style>
	.incomes {
		color: rgb(0, 0, 0);
		background-color: rgb(40, 223, 166);
	}

	.expenses {
		color: rgb(0, 0, 0);
		background-color: rgb(247, 96, 96);
	}
</style>
