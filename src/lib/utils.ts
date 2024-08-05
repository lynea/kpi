import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export type Value = {
	label: string;
	score: number;
};

export type Score = {
	title: string;
	target: number;
	explaination?: string;
	heigerIsBetter: boolean;
	mayExceed: boolean;
	values: Value[];
};

export type Group = {
	title: string;
	scores: Score[];
};

export const getAverageScore = (score: Score, overTargetToZero: boolean) => {
	// Calculate the average of scores
	const average = score.values.reduce((acc, value) => acc + value.score, 0) / score.values.length;

	const afterRuling = applyScoreRuling(
		average,
		score.target,
		overTargetToZero,
		score.heigerIsBetter
	).score;

	return {
		title: score.title,
		averageScore: afterRuling
	};
};

export const applyScoreRuling = (
	score: number,
	target: number,
	overTargetToZero: boolean,
	heigerIsBetter: boolean,
	mayExceed: boolean = false
) => {
	//todo: add support for baseLine example : base line is 50 and target is 100
	//todo: add support for weight example : 2 so the score of that group should count more than the others
	let normalizedScore;
	const appliedRuling: string[] = [];

	if (heigerIsBetter === false) {
		appliedRuling.push('Lower scores are better.');
		if (overTargetToZero && score > target) {
			//when lower scores are better and we see scores that are over the target as not achieved we can normalize the score to 0
			normalizedScore = 0;
			appliedRuling.push('The score is over the target and is considered as not achieved.');
		} else {
			// When lower scores are better, you can calculate how much lower the average is than the target
			// This gives more weight to scores that are much lower than the target, and penalizes higher scores
			normalizedScore = (target / score) * 100;
		}
	} else {
		// Normalize the average score compared to the target for cases where higher is better
		appliedRuling.push('Higher scores are better.');
		normalizedScore = (score / target) * 100;
	}

	if (mayExceed === false && normalizedScore > 100) {
		appliedRuling.push('The score is over the target and is considered as 100%');
		normalizedScore = 100;
	}

	return {
		score: normalizedScore,
		appliedRules: appliedRuling
	};
};

export const generateExplaination = (score: Score, overTargetToZero: boolean) => {
	const scoreAverage = (
		score.values.reduce((acc, value) => acc + value.score, 0) / score.values.length
	).toFixed(2);

	let explaination = `the average score is ${scoreAverage} and the target is ${score.target.toFixed(2)}. `;

	const ruling = score.values
		.map(
			(value) =>
				applyScoreRuling(
					value.score,
					score.target,
					overTargetToZero,
					score.heigerIsBetter,
					score.mayExceed
				).appliedRules
		)
		?.at(0)
		?.join(' ');

	explaination += ruling;

	return explaination;
};
