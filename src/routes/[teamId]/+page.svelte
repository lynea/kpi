<script lang="ts">
	import { data as data } from '$lib/data/charts.json';
	import DoughnutChart from './DoughnutChart.svelte';
	import ScoreSection from './ScoreSection.svelte';

	let totals = data.groups.map((group) => {
		let groupScores =
			group.scores
				.map((score) => {
					// Calculate the average of scores
					let average =
						score.values.reduce((acc, value) => acc + value.score, 0) / score.values.length;

					let normalizedScore;
					if (score.heigerIsBetter === false) {
						if (data.settings.overTargetToZero) {
							normalizedScore = 0;
						} else {
							// When lower scores are better, you can calculate how much lower the average is than the target
							// This gives more weight to scores that are much lower than the target, and penalizes higher scores
							normalizedScore = (score.target / average) * 100;
						}
					} else {
						// Normalize the average score compared to the target for cases where higher is better
						normalizedScore = (average / score.target) * 100;
					}

					return {
						title: score.title,
						averageScore: normalizedScore
					};
				})
				// Calculate the average score for the group
				.reduce((acc, score) => acc + score.averageScore, 0) / group.scores.length;

		return {
			title: group.title,
			groupScores
		};
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="KPI dashboard" />
</svelte:head>
<div class="bg-purple-500 h-80 flex justify-center items-center">
	<h1 class="text-6xl text-gray-50 font-bold h-fit">Sales KPI metrics</h1>
</div>
<!-- <enhanced:img src="./image.png" sizes="min(1280px, 100vw)" /> -->
<section class="flex flex-col items-center mt-10 px-10">
	<section
		class="w-full flex justify-center mb-10 flex-col items-center rounded-lg drop-shadow-xl bg-slate-100 py-5"
	>
		<h2 class="text-main-purple-400 text-4xl font-bold mb-4">Total status</h2>
		<div class={`grid grid-cols-4 gap-4 w-11/12`}>
			{#each totals as total}
				<div class="col-span-1 flex flex-col items-center text-main-purple-400 font-bold">
					<DoughnutChart
						data={[
							{ label: 'succes', score: total.groupScores > 100 ? 100 : total.groupScores },
							{ label: 'fail', score: total.groupScores >= 100 ? 0 : 100 - total.groupScores }
						]}
						title={total.title}
					/>
					<h3 class=" mt-4 font-bold">{total.title}</h3>
					<p class={total.groupScores >= 100 ? 'text-green-600' : 'text-red-500'}>
						{Math.ceil(total.groupScores)}%
					</p>
				</div>
			{/each}
		</div>
	</section>
	{#each data.groups as group}
		<ScoreSection groupScores={group.scores} groupTitle={group.title} />
	{/each}
</section>
