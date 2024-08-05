<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { applyScoreRuling, generateExplaination, type Score } from '$lib/utils';
	import BarChart from './BarChart.svelte';
	export let groupScores: Score[] = [];
	export let settings: { overTargetToZero: boolean } = { overTargetToZero: false };

	export let groupTitle;

	// for each score in the group, calculate the score compared to the target

	let scoresComparedToTarget: Score[] = groupScores.map((groupScore) => {
		let values = groupScore.values.map((value) => {
			const score = applyScoreRuling(
				value.score,
				groupScore.target,
				settings.overTargetToZero,
				groupScore.heigerIsBetter,
				groupScore.mayExceed
			).score;

			return {
				...value,
				score: score
			};
		});

		return {
			...groupScore,

			values: values
		};
	});

	let withExplainaiton: Score[] = scoresComparedToTarget.map((score) => {
		const rawScore = groupScores.find((groupScore) => groupScore.title === score.title);

		return {
			...score,
			explaination: rawScore
				? generateExplaination(rawScore, settings.overTargetToZero)
				: 'no explaination available'
		};
	});
</script>

<section
	class="w-full flex flex-col mb-10 items-center rounded-lg drop-shadow-xl bg-slate-100 py-5"
>
	<h2 class="text-main-purple-400 text-4xl mb-4 font-bold">{groupTitle} Breakdown</h2>
	<div class="grid grid-cols-2 gap-10 w-11/12">
		{#each withExplainaiton as groupScore}
			<div class="col-span-1">
				<div
					class="flex flex-col justify-center h-full min-h-80 border-2 border-main-purple-400 rounded-lg p-5"
				>
					{#if groupScore.values.length > 1}
						<BarChart data={groupScore.values} title={groupScore.title} />
						<p class="text-center">
							score: {(
								groupScore.values.reduce((acc, value) => acc + value.score, 0) /
								groupScore.values.length
							).toFixed()} %
						</p>
					{:else if groupScore.values.length == 1}
						<p class="text-center text-3xl font-bold">{groupScore.title}</p>
						<p class="text-center text-6xl font-bold">
							{(
								groupScore.values.reduce((acc, value) => acc + value.score, 0) /
								groupScore.values.length
							).toFixed()} %
						</p>
					{:else}
						<p class="text-center">No data available</p>
					{/if}

					<div class="flex justify-center">
						<HoverCard.Root>
							<HoverCard.Trigger
								class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
							>
								How is this calculated?
							</HoverCard.Trigger>
							<HoverCard.Content class="w-80">
								<div class="flex flex-col">
									{groupScore.explaination}
								</div></HoverCard.Content
							>
						</HoverCard.Root>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
