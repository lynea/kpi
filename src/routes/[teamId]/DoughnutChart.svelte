<script lang="ts">
	import { browser } from '$app/environment';
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	Chart.register(...registerables);
	let doughnutChartElement: HTMLCanvasElement;

	export let title = 'Satisfaction';
	export let data: { label: string; score: number }[] = [];

	const chartData = {
		labels: data.map(({ label }) => label),
		datasets: [
			{
				label: `${title} (%)`,
				data: data.map(({ score }) => (score > 100 ? 100 : score)),
				backgroundColor: ['#472075', 'hsl(332, 100%, 74%)'],
				hoverOffset: 10,
				borderColor: ['hsl(0, 100%, 99%)'],
				borderRadius: 4,
				borderWidth: 2
			}
		]
	};

	onMount(() => {
		if (browser) {
			new Chart(doughnutChartElement, {
				type: 'doughnut',
				data: chartData,

				options: {
					plugins: {
						legend: {
							display: true
						}
					},
					scales: {}
				}
			});
		}
	});
</script>

<div class="">
	<canvas bind:this={doughnutChartElement} />
</div>
