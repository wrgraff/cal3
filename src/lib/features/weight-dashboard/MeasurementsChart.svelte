<script lang="ts">
	import type { BodyMeasurement } from '$lib/features/weight-tracking';
	import { daysBetween, prettyDate } from '$lib/features/weight-tracking';

	interface Props {
		measurements: BodyMeasurement[];
	}

	let { measurements }: Props = $props();

	const width = 520;
	const height = 180;
	const padding = { top: 14, right: 14, bottom: 28, left: 34 };
	const sorted = $derived([...measurements].sort((a, b) => a.date.localeCompare(b.date)));
	const dates = $derived({
		from: sorted[0]?.date ?? '2026-01-01',
		to: sorted.at(-1)?.date ?? '2026-01-02'
	});
	const domain = $derived(getDomain(sorted));
	const chestPath = $derived(pathFor('chestCm'));
	const waistPath = $derived(pathFor('waistCm'));
	const hipsPath = $derived(pathFor('hipsCm'));

	function getDomain(rows: BodyMeasurement[]) {
		const values = rows
			.flatMap((row) => [row.chestCm, row.waistCm, row.hipsCm])
			.filter((value): value is number => value != null);
		if (values.length === 0) return { min: 80, max: 110 };
		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = Math.max(1, max - min);
		return { min: min - span * 0.16, max: max + span * 0.16 };
	}

	function xFor(date: string) {
		const total = Math.max(1, daysBetween(dates.from, dates.to));
		return (
			padding.left +
			(daysBetween(dates.from, date) / total) * (width - padding.left - padding.right)
		);
	}

	function yFor(value: number) {
		const total = Math.max(1, domain.max - domain.min);
		return (
			padding.top + (1 - (value - domain.min) / total) * (height - padding.top - padding.bottom)
		);
	}

	function pathFor(key: 'chestCm' | 'waistCm' | 'hipsCm') {
		return sorted
			.filter((measurement) => measurement[key] != null)
			.map(
				(measurement, index) =>
					`${index === 0 ? 'M' : 'L'} ${xFor(measurement.date).toFixed(2)} ${yFor(measurement[key] as number).toFixed(2)}`
			)
			.join(' ');
	}
</script>

<div class="space-y-3" aria-labelledby="measurements-chart-title">
	<div>
		<h3 id="measurements-chart-title" class="text-base font-semibold">Body measurements</h3>
		<p class="text-muted-foreground text-xs">Chest, waist and hips over time.</p>
	</div>

	{#if sorted.length === 0}
		<div class="bg-muted/40 text-muted-foreground rounded-lg border p-6 text-center text-sm">
			No measurements yet.
		</div>
	{:else}
		<div
			class="bg-muted/40 overflow-hidden rounded-lg border"
			role="img"
			aria-label="Body measurement chart for chest, waist and hips"
		>
			<svg viewBox={`0 0 ${width} ${height}`} class="h-44 w-full" aria-hidden="true">
				<line
					x1={padding.left}
					x2={width - padding.right}
					y1={height - padding.bottom}
					y2={height - padding.bottom}
					class="stroke-border"
				/>
				<text x={padding.left} y={height - 8} class="fill-muted-foreground text-xs"
					>{prettyDate(dates.from)}</text
				>
				<text
					x={width - padding.right}
					y={height - 8}
					text-anchor="end"
					class="fill-muted-foreground text-xs">{prettyDate(dates.to)}</text
				>
				{#if chestPath}<path
						d={chestPath}
						fill="none"
						class="stroke-info"
						stroke-width="3"
						stroke-linecap="round"
					/>{/if}
				{#if waistPath}<path
						d={waistPath}
						fill="none"
						class="stroke-primary"
						stroke-width="3"
						stroke-linecap="round"
					/>{/if}
				{#if hipsPath}<path
						d={hipsPath}
						fill="none"
						class="stroke-success"
						stroke-width="3"
						stroke-linecap="round"
					/>{/if}
			</svg>
		</div>
	{/if}

	<ul class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
		<li><span class="text-info">━━</span> Chest</li>
		<li><span class="text-primary">━━</span> Waist</li>
		<li><span class="text-success">━━</span> Hips</li>
	</ul>
</div>
