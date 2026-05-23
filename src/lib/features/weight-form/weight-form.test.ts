import { describe, expect, it } from 'vitest';

import type { WeightEntry, WeightGoal } from './weight-form.types';
import {
	buildDailyWeightMetrics,
	calculateTargetDate,
	deriveWeightDashboard,
	getForecastEndpoint,
	plannedWeight
} from './weight-form.utils';

const goal: WeightGoal = {
	id: 'goal-1',
	startDate: '2026-01-01',
	startWeightKg: 80,
	targetWeightKg: 70,
	weeklyLossKg: 0.5,
	calculatedTargetDate: '2026-05-21',
	status: 'active',
	revisionOfGoalId: null,
	createdAt: '2026-01-01T00:00:00Z',
	updatedAt: '2026-01-01T00:00:00Z'
};

function entry(date: string, morningWeightKg: number | null): WeightEntry {
	return {
		id: date,
		date,
		morningWeightKg,
		eveningWeightKg: null,
		tags: [],
		createdAt: `${date}T00:00:00Z`,
		updatedAt: `${date}T00:00:00Z`
	};
}

describe('weight metric calculations', () => {
	it('carries missing morning weight only in derived metric fields', () => {
		const metrics = buildDailyWeightMetrics({
			activeGoal: goal,
			currentDate: '2026-01-03',
			entries: [entry('2026-01-01', 80), entry('2026-01-03', 79)]
		});

		expect(metrics[1]).toMatchObject({
			date: '2026-01-02',
			morningWeightKg: null,
			carriedForwardMorningWeightKg: 80,
			morningWeightImputed: true
		});
	});

	it('preserves raw chart gaps while smoothing from carried-forward values', () => {
		const metrics = buildDailyWeightMetrics({
			activeGoal: goal,
			currentDate: '2026-01-03',
			entries: [entry('2026-01-01', 80), entry('2026-01-03', 77)]
		});

		expect(metrics.slice(0, 3).map((metric) => metric.morningWeightKg)).toEqual([80, null, 77]);
		expect(metrics.at(2)?.smoothedAverageKg).toBeCloseTo(79);
		expect(metrics.at(2)?.smoothedMedianKg).toBe(80);
	});

	it('calculates target date and planned weight line', () => {
		expect(calculateTargetDate(goal)).toBe('2026-05-21');
		expect(plannedWeight(goal, '2026-01-08')).toBeCloseTo(79.5);
	});

	it('uses status thresholds around the planned line', () => {
		const ahead = deriveWeightDashboard({
			currentDate: '2026-01-08',
			entries: Array.from({ length: 8 }, (_, index) =>
				entry(`2026-01-${String(index + 1).padStart(2, '0')}`, 78)
			),
			goals: [goal],
			measurements: []
		});
		expect(ahead.summary.status).toBe('ahead');

		const behind = deriveWeightDashboard({
			currentDate: '2026-01-08',
			entries: Array.from({ length: 8 }, (_, index) =>
				entry(`2026-01-${String(index + 1).padStart(2, '0')}`, 80.5)
			),
			goals: [goal],
			measurements: []
		});
		expect(behind.summary.status).toBe('behind');
	});

	it('only exposes forecast after seven usable days', () => {
		const shortMetrics = buildDailyWeightMetrics({
			activeGoal: goal,
			currentDate: '2026-01-06',
			entries: Array.from({ length: 6 }, (_, index) =>
				entry(`2026-01-${String(index + 1).padStart(2, '0')}`, 80 - index * 0.1)
			)
		});
		expect(
			getForecastEndpoint({ metrics: shortMetrics, goal, currentDate: '2026-01-06' })
		).toBeNull();

		const enoughMetrics = buildDailyWeightMetrics({
			activeGoal: goal,
			currentDate: '2026-01-08',
			entries: Array.from({ length: 8 }, (_, index) =>
				entry(`2026-01-${String(index + 1).padStart(2, '0')}`, 80 - index * 0.1)
			)
		});
		expect(
			getForecastEndpoint({ metrics: enoughMetrics, goal, currentDate: '2026-01-08' })
		).not.toBeNull();
	});

	it('marks reached when smoothed weight reaches target', () => {
		const reached = deriveWeightDashboard({
			currentDate: '2026-01-08',
			entries: Array.from({ length: 8 }, (_, index) =>
				entry(`2026-01-${String(index + 1).padStart(2, '0')}`, 69.8)
			),
			goals: [goal],
			measurements: []
		});

		expect(reached.summary.status).toBe('reached');
	});
});
