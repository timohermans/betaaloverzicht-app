<script lang="ts">
	import { transactions, date } from '$lib/store';
	import { convertAmount } from './transaction';
	import Chart from 'chart.js/auto';

	let incomes = 0;
	let expenses = 0;
	let balance = 0;
	let incomesChartData = [];
	let expensesChartData = [];
	let balanceChartData = [];
	let chartLabels = [];

	let incomeCanvas: HTMLCanvasElement;
	let expensesCanvas: HTMLCanvasElement;
	let balanceCanvas: HTMLCanvasElement;

	$: if ($transactions.length > 0 && $date != null && incomeCanvas) {
		incomes = 0;
		expenses = 0;

		// TODO: (M) unit test chart data
		const finalDay = new Date($date.getFullYear(), $date.getMonth() + 1, -1).getDate();
		for (let i = 0; i < finalDay; i++) {
			incomesChartData[i] = 0;
			expensesChartData[i] = 0;
			balanceChartData[i] = 0;
			chartLabels[i] = (i + 1).toString();
		}

		$transactions?.forEach((t) => {
			const amount = convertAmount(t.amount, t.category?.is_ignored_in_totals);
			const dayIndex = new Date(t.date_transaction).getDate();

			if (amount < 0) {
				expenses += amount;

				for (let i = dayIndex; i < finalDay; i++) {
					expensesChartData[i] += amount;
				}
			} else {
				incomes += amount;

				for (let i = dayIndex; i < finalDay; i++) {
					incomesChartData[i] += amount;
				}
			}

			for (let i = dayIndex; i < finalDay; i++) {
				balanceChartData[i] += amount;
			}
		});

		balance = incomes - Math.abs(expenses);

		renderChart(incomeCanvas, incomesChartData, 'rgb(255, 255, 255)');
		renderChart(expensesCanvas, expensesChartData, 'rgb(255, 255, 255)');
		renderChart(balanceCanvas, balanceChartData, 'rgb(255, 255, 255)');
	}

	function renderChart(canvas: HTMLCanvasElement, data: number[], borderColor: string) {
		new Chart(canvas.getContext('2d'), {
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
					}
				]
			}
		});
	}
</script>

<div class="grid">
	<article class="incomes">
		<span>Inkomsten</span>
		<canvas id="mychart" bind:this={incomeCanvas} height="150" />
		<center>{incomes.toFixed(2)}</center>
	</article>

	<article class="expenses">
		<span>Uitgaven</span>
		<canvas bind:this={expensesCanvas} height="150" />
		<center>{expenses.toFixed(2)}</center>
	</article>

	<article class:expenses={balance < 0} class:incomes={balance >= 0}>
		<span>Balans</span>
		<canvas bind:this={balanceCanvas} height="150" />
		<center>{balance.toFixed(2)}</center>
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
