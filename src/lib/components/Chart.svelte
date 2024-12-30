<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let data = [20, 100, 50, 12, 20, 130, 45];
	let labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	let ctx;
	let canvas: HTMLCanvasElement;

	export let lineColor;
	export let width;
	export let height;

	onMount(() => {
		ctx = canvas.getContext('2d');
		new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Unit Sales',
						data: data,
						borderColor: lineColor, // Dark purple for the line
						pointBackgroundColor: lineColor, // Dark purple points
						pointBorderColor: lineColor,
						pointRadius: 5, // Increase the size of the points
						pointHoverRadius: 7, // Make points larger on hover
						tension: 0.4 // Smooth curves
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
							color: '#ffff', // Dark purple for legend text
							font: {
								size: 14,
								weight: 'bold'
							}
						}
					},
					tooltip: {
						callbacks: {
							label: function (tooltipItem) {
								return `Sales: ${tooltipItem.raw}`;
							}
						}
					}
				},
				scales: {
					x: {
						ticks: {
							color: '#ffff', // Dark purple for X-axis labels
							font: {
								size: 12
							}
						}
					},
					y: {
						ticks: {
							color: '#ffff', // Dark purple for Y-axis labels
							font: {
								size: 12
							}
						},
						grid: {
							color: '#1B232F' // Light purple grid lines
						},
						beginAtZero: true // Ensure the graph starts from zero
					}
				}
			}
		});
	});
</script>

<canvas bind:this={canvas} {width} {height}></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
		background-color: #181819;
		border-radius: 8px; /* Add rounded corners */
		padding: 10px;
	}
</style>
