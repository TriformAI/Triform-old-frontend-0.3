<script lang="ts">
	import { onMount } from 'svelte'
	import Chart from 'chart.js/auto'
	import { onDestroy } from 'svelte'

	let canvas: HTMLCanvasElement
	let chart: Chart | undefined // Reference to the Chart.js instance

	export let lineColor
	export let width
	export let height
	export let data: { overall: { categories: string[]; series: number[] } } // New data prop to be passed into the component

	let labels: string[] = []
	let dataset: number[] = []

	// Function to update chart when data changes
	function updateChart() {
		if (data) {
			labels = data.overall.categories
			dataset = Object.values(data.overall.series)

			if (chart) {
				chart.data.labels = labels
				chart.data.datasets[0].data = dataset
				chart.update()
			}
		}
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Unit Sales',
						data: dataset,
						borderColor: lineColor,
						pointBackgroundColor: lineColor,
						pointBorderColor: lineColor,
						pointRadius: 5,
						pointHoverRadius: 7,
						tension: 0.4
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							color: '#ffff',
							font: {
								size: 14,
								weight: 'bold'
							}
						}
					},
					tooltip: {
						callbacks: {
							label: function (tooltipItem) {
								return `Sales: ${tooltipItem.raw}`
							}
						}
					}
				},
				scales: {
					x: {
						ticks: {
							color: '#ffff',
							font: {
								size: 12
							}
						}
					},
					y: {
						ticks: {
							color: '#ffff',
							font: {
								size: 12
							}
						},
						grid: {
							color: '#1B232F'
						},
						beginAtZero: true
					}
				}
			}
		})

		updateChart()
	})

	onDestroy(() => {
		if (chart) {
			chart.destroy() // Clean up the chart instance on component destroy
		}
	})

	// Watch for changes to the `data` prop and update the chart
	$: if (data) {
		updateChart()
	}
</script>

<canvas bind:this={canvas} {width} {height}></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
		background-color: #181819;
		border-radius: 8px;
		padding: 10px;
	}
</style>
