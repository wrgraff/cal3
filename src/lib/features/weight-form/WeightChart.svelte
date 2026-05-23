<script lang="ts">
	import type { ChartRange, DailyWeightMetric, WeightGoal } from './weight-form.types';
	import {
		addDays,
		daysBetween,
		getForecastEndpoint,
		plannedWeight,
		prettyDate
	} from './weight-form.utils';

	interface Props {
		metrics: DailyWeightMetric[];
		goal: WeightGoal | null;
		currentDate: string;
		range?: ChartRange;
	}

	let { metrics, goal, currentDate, range = 'goal' }: Props = $props();

	const width = 640;
	const height = 260;
	const padding = { top: 16, right: 16, bottom: 34, left: 42 };
	const innerWidth = width - padding.left - padding.right;
	const innerHeight = height - padding.top - padding.bottom;

	const rangeDates = $derived(getRangeDates(range, goal, currentDate));
	const visibleMetrics = $derived(
		metrics.filter((metric) => metric.date >= rangeDates.from && metric.date <= rangeDates.to)
	);
	const yDomain = $derived(getYDomain(visibleMetrics, goal));
	const forecast = $derived(getForecastEndpoint({ metrics, goal, currentDate }));
	const morningPath = $derived(
		linePath(
			visibleMetrics
				.filter((metric) => metric.morningWeightKg != null)
				.map((metric) =>
					pointFor(metric.date, metric.morningWeightKg as number, rangeDates, yDomain)
				)
		)
	);
	const eveningPath = $derived(
		linePath(
			visibleMetrics
				.filter((metric) => metric.eveningWeightKg != null)
				.map((metric) =>
					pointFor(metric.date, metric.eveningWeightKg as number, rangeDates, yDomain)
				)
		)
	);
	const smoothPath = $derived(
		linePath(
			visibleMetrics
				.filter((metric) => metric.smoothedAverageKg != null)
				.map((metric) =>
					pointFor(metric.date, metric.smoothedAverageKg as number, rangeDates, yDomain)
				)
		)
	);
	const plannedPath = $derived(getPlannedPath(goal, rangeDates, yDomain));
	const forecastPath = $derived(getForecastPath(forecast, rangeDates, yDomain));
	const yTicks = $derived(getYTicks(yDomain));
	const xTicks = $derived(getXTicks(rangeDates));

	function getRangeDates(selectedRange: ChartRange, activeGoal: WeightGoal | null, today: string) {
		if (selectedRange === '7d') return { from: addDays(today, -6), to: today };
		if (selectedRange === '30d') return { from: addDays(today, -29), to: today };
		if (selectedRange === '1y') return { from: addDays(today, -364), to: today };
		return {
			from: activeGoal?.startDate ?? addDays(today, -29),
			to: activeGoal?.calculatedTargetDate ?? today
		};
	}

	function getYDomain(rows: DailyWeightMetric[], activeGoal: WeightGoal | null) {
		const values = rows
			.flatMap((metric) => [
				metric.morningWeightKg,
				metric.eveningWeightKg,
				metric.smoothedAverageKg,
				metric.plannedWeightKg
			])
			.filter((value): value is number => value != null);

		if (activeGoal) {
			values.push(activeGoal.startWeightKg, activeGoal.targetWeightKg);
		}

		if (values.length === 0) return { min: 60, max: 90 };
		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = Math.max(max - min, 1);
		return { min: min - span * 0.12, max: max + span * 0.12 };
	}

	function xFor(date: string, dates: { from: string; to: string }) {
		const total = Math.max(1, daysBetween(dates.from, dates.to));
		return padding.left + (daysBetween(dates.from, date) / total) * innerWidth;
	}

	function yFor(value: number, domain: { min: number; max: number }) {
		const total = Math.max(1, domain.max - domain.min);
		return padding.top + (1 - (value - domain.min) / total) * innerHeight;
	}

	function pointFor(
		date: string,
		value: number,
		dates: { from: string; to: string },
		domain: { min: number; max: number }
	) {
		return { x: xFor(date, dates), y: yFor(value, domain) };
	}

	function linePath(points: Array<{ x: number; y: number }>) {
		return points
			.map(
				(point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
			)
			.join(' ');
	}

	function getPlannedPath(
		activeGoal: WeightGoal | null,
		dates: { from: string; to: string },
		domain: { min: number; max: number }
	) {
		if (!activeGoal) return '';
		const from = dates.from < activeGoal.startDate ? activeGoal.startDate : dates.from;
		const to =
			dates.to > activeGoal.calculatedTargetDate ? activeGoal.calculatedTargetDate : dates.to;
		const fromValue = plannedWeight(activeGoal, from);
		const toValue = plannedWeight(activeGoal, to);
		if (fromValue == null || toValue == null) return '';
		return linePath([
			pointFor(from, fromValue, dates, domain),
			pointFor(to, toValue, dates, domain)
		]);
	}

	function getForecastPath(
		forecastPoint: ReturnType<typeof getForecastEndpoint>,
		dates: { from: string; to: string },
		domain: { min: number; max: number }
	) {
		if (!forecastPoint || forecastPoint.fromDate < dates.from || forecastPoint.fromDate > dates.to)
			return '';
		const toDate = forecastPoint.toDate > dates.to ? dates.to : forecastPoint.toDate;
		const days = Math.max(1, daysBetween(forecastPoint.fromDate, forecastPoint.toDate));
		const visibleDays = daysBetween(forecastPoint.fromDate, toDate);
		const toWeight =
			forecastPoint.fromWeightKg +
			((forecastPoint.toWeightKg - forecastPoint.fromWeightKg) / days) * visibleDays;
		return linePath([
			pointFor(forecastPoint.fromDate, forecastPoint.fromWeightKg, dates, domain),
			pointFor(toDate, toWeight, dates, domain)
		]);
	}

	function getYTicks(domain: { min: number; max: number }) {
		const start = Math.ceil(domain.min);
		const end = Math.floor(domain.max);
		const ticks: number[] = [];
		for (let value = start; value <= end; value += 1) ticks.push(value);
		return ticks.filter((_, index) => index % Math.max(1, Math.ceil(ticks.length / 5)) === 0);
	}

	function getXTicks(dates: { from: string; to: string }) {
		const total = Math.max(1, daysBetween(dates.from, dates.to));
		const step = Math.max(1, Math.round(total / 4));
		const ticks: string[] = [];
		for (let day = 0; day <= total; day += step) ticks.push(addDays(dates.from, day));
		if (!ticks.includes(dates.to)) ticks.push(dates.to);
		return ticks;
	}
</script>

<div class="space-y-3" aria-labelledby="weight-chart-title">
	<div class="flex items-start justify-between gap-3">
		<div>
			<h3 id="weight-chart-title" class="text-base font-semibold">Weight trend</h3>
			<p class="text-muted-foreground text-xs">
				Morning, evening, smoothed average, plan and forecast.
			</p>
		</div>
		<div class="text-muted-foreground text-xs">{range.toUpperCase()}</div>
	</div>

	<div
		class="bg-muted/40 overflow-hidden rounded-lg border"
		role="img"
		aria-label="Weight chart showing raw and smoothed progress against plan"
	>
		<svg viewBox={`0 0 ${width} ${height}`} class="h-64 w-full" aria-hidden="true">
			{#each yTicks as tick}
				<line
					x1={padding.left}
					x2={width - padding.right}
					y1={yFor(tick, yDomain)}
					y2={yFor(tick, yDomain)}
					class="stroke-border"
					stroke-width="1"
				/>
				<text
					x={padding.left - 8}
					y={yFor(tick, yDomain) + 4}
					text-anchor="end"
					class="fill-muted-foreground text-xs">{tick}</text
				>
			{/each}
			{#each xTicks as tick}
				<text
					x={xFor(tick, rangeDates)}
					y={height - 12}
					text-anchor="middle"
					class="fill-muted-foreground text-xs">{prettyDate(tick)}</text
				>
			{/each}
			{#if plannedPath}
				<path
					d={plannedPath}
					fill="none"
					class="stroke-muted-foreground"
					stroke-width="2"
					stroke-dasharray="6 6"
				/>
			{/if}
			{#if forecastPath}
				<path
					d={forecastPath}
					fill="none"
					class="stroke-info"
					stroke-width="2"
					stroke-dasharray="3 5"
				/>
			{/if}
			{#if eveningPath}
				<path d={eveningPath} fill="none" class="stroke-warning" stroke-width="1.5" opacity="0.8" />
			{/if}
			{#if morningPath}
				<path
					d={morningPath}
					fill="none"
					class="stroke-foreground"
					stroke-width="1.5"
					opacity="0.55"
				/>
			{/if}
			{#if smoothPath}
				<path
					d={smoothPath}
					fill="none"
					class="stroke-primary"
					stroke-width="4"
					stroke-linecap="round"
				/>
			{/if}
		</svg>
	</div>

	<ul class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
		<li><span class="text-primary">━━</span> Smoothed</li>
		<li><span class="text-foreground">━━</span> Morning</li>
		<li><span class="text-warning">━━</span> Evening</li>
		<li><span class="text-muted-foreground">- -</span> Plan</li>
		<li><span class="text-info">- -</span> Forecast</li>
	</ul>
</div>
