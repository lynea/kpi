<script lang="ts">
	import { browser } from '$app/environment';
	import type { Value } from '$lib/utils';
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	Chart.register(...registerables);
	let barChartElement: HTMLCanvasElement;

	export let title = 'xyz';
	export let data: Value[] = [];

	const chartData = {
		labels: data.map(({ label }) => label),
		datasets: [
			{
				label: `${title} (%)`,
				data: data.map(({ score }) => score),
				backgroundColor: ['#986FC4', '#472075', '#24103A'],

				borderColor: ['hsl(0, 100%, 99%)'],
				borderRadius: 4,
				borderWidth: 2
			}
		]
	};

	onMount(() => {
		if (browser) {
			new Chart(barChartElement, {
				type: 'bar',
				data: chartData,
				options: {
					plugins: {
						legend: {
							display: false
						}
					},
					scales: {
						x: {
							grid: {
								color: 'hsl(332, 100%, 74%)'
							},
							ticks: { color: '#24103A' },
							title: {
								display: true,
								text: 'sprint no.',
								color: '#24103A'
							}
						},
						y: {
							beginAtZero: true,
							ticks: { color: '#24103A', font: { size: 18 } },
							grid: {
								color: 'hsl(332, 100%, 74%)'
							},
							title: {
								display: true,
								text: `${title} %`,
								color: '#24103A'
								// font: { size: 24, family: 'Merriweather' }
							}
						}
					}
				}
			});
		}
	});
</script>

<div class="">
	<canvas bind:this={barChartElement} />
</div>
