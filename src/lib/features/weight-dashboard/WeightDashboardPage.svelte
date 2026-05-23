<script lang="ts">
	import { CalendarDays, History, Plus, Ruler, Scale, Settings2 } from '@lucide/svelte';

	import { Card, LinkButton } from '$lib/components/ui';

	import MeasurementsChart from './MeasurementsChart.svelte';
	import WeightChart from './WeightChart.svelte';
	import type { ChartRange, WeightTrackingData } from '$lib/features/weight-tracking';
	import {
		STATUS_LABELS,
		deriveWeightDashboard,
		formatNumber,
		prettyDate,
		todayIso
	} from '$lib/features/weight-tracking';

	interface Props {
		data: WeightTrackingData;
	}

	let { data }: Props = $props();

	let chartRange = $state<ChartRange>('goal');

	const dashboard = $derived(deriveWeightDashboard(data));
	const entryHref = $derived(`/form/weight?date=${todayIso()}`);
	const measurementHref = $derived(`/form/measurements?date=${todayIso()}`);

	function statusTone(status: string): string {
		if (status === 'ahead' || status === 'reached') return 'bg-success text-success-foreground';
		if (status === 'behind') return 'bg-warning text-warning-foreground';
		if (status === 'on_track') return 'bg-info text-info-foreground';
		return 'bg-secondary text-secondary-foreground';
	}

	function deltaLabel(value: number | null, unit: string): string {
		if (value == null) return '—';
		return `${value > 0 ? '+' : ''}${value.toFixed(1)} ${unit}`;
	}
</script>

<section class="space-y-5 pb-20" aria-labelledby="form-heading">
	<header class="space-y-3">
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Today</p>
				<h2 id="form-heading" class="text-2xl font-semibold tracking-tight">Form</h2>
			</div>
			<div
				class="bg-secondary text-secondary-foreground flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
			>
				<CalendarDays size={16} aria-hidden="true" />
				<span>{prettyDate(dashboard.currentDate, true)}</span>
			</div>
		</div>
	</header>

	<div class="grid gap-3 sm:grid-cols-2">
		<Card class="p-4 sm:col-span-2">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-muted-foreground text-sm">Current</p>
					<p class="text-4xl font-semibold tracking-tight">
						{formatNumber(dashboard.summary.currentWeightKg)}<span
							class="text-muted-foreground text-base"
						>
							kg</span
						>
					</p>
					<p class="text-muted-foreground text-xs">
						Latest morning {formatNumber(dashboard.summary.latestMorningWeightKg)} kg
					</p>
				</div>
				<Scale class="text-muted-foreground" size={24} aria-hidden="true" />
			</div>
		</Card>

		<Card class="p-4">
			<p class="text-muted-foreground text-sm">Week pace</p>
			<p class="text-2xl font-semibold">
				{#if dashboard.summary.actualPaceKgPerWeek == null}
					—
				{:else}
					{dashboard.summary.actualPaceKgPerWeek >= 0 ? '-' : '+'}{Math.abs(
						dashboard.summary.actualPaceKgPerWeek
					).toFixed(2)}
				{/if}
				<span class="text-muted-foreground text-sm"> kg/wk</span>
			</p>
			<p class="text-muted-foreground text-xs">
				Planned -{formatNumber(dashboard.summary.plannedPaceKgPerWeek, 2)} kg/wk
			</p>
		</Card>

		<Card class="p-4">
			<p class="text-muted-foreground text-sm">Status</p>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<span
					class={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(dashboard.summary.status)}`}
				>
					{STATUS_LABELS[dashboard.summary.status]}
				</span>
				<span class="text-sm font-medium"
					>{deltaLabel(dashboard.summary.deltaVsPlanKg, 'kg')} vs plan</span
				>
			</div>
			<p class="text-muted-foreground mt-2 text-xs">
				{dashboard.summary.daysOfData}/7 measured days for forecast.
			</p>
		</Card>
	</div>

	<Card class="space-y-4 p-4">
		<div class="space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 class="text-base font-semibold">Progress</h3>
					<p class="text-muted-foreground text-xs">
						Goal period is the default view when an active goal exists.
					</p>
				</div>
				<div
					class="bg-secondary grid grid-cols-4 rounded-md p-1"
					role="group"
					aria-label="Chart range"
				>
					{#each ['7d', '2w', '30d', 'goal'] as rangeOption}
						<button
							type="button"
							aria-pressed={chartRange === rangeOption}
							class={`rounded-sm px-2 py-1 text-xs font-medium transition-colors ${chartRange === rangeOption ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
							onclick={() => (chartRange = rangeOption as ChartRange)}
						>
							{rangeOption.toUpperCase()}
						</button>
					{/each}
				</div>
			</div>
			<div class="grid gap-2 sm:grid-cols-2">
				<LinkButton href="/form/goal" variant="outline" class="w-full">
					<Settings2 size={16} aria-hidden="true" />
					Goal settings
				</LinkButton>
				<LinkButton href="/form/history" variant="outline" class="w-full">
					<History size={16} aria-hidden="true" />
					History
				</LinkButton>
			</div>
		</div>
		<WeightChart
			metrics={dashboard.metrics}
			goal={dashboard.activeGoal}
			currentDate={dashboard.currentDate}
			range={chartRange}
		/>
	</Card>

	<Card class="space-y-4 p-4">
		<div class="grid gap-4 sm:grid-cols-2 sm:items-center">
			<MeasurementsChart measurements={dashboard.measurements} />
			<div class="grid grid-cols-3 gap-2 sm:w-36 sm:grid-cols-1">
				<div>
					<p class="text-muted-foreground text-xs">Chest</p>
					<p class="font-semibold">{formatNumber(dashboard.measurementSummary.chest.current)} cm</p>
					<p class="text-muted-foreground text-xs">
						{deltaLabel(dashboard.measurementSummary.chest.previousDelta, 'cm')}
					</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Waist</p>
					<p class="font-semibold">{formatNumber(dashboard.measurementSummary.waist.current)} cm</p>
					<p class="text-muted-foreground text-xs">
						{deltaLabel(dashboard.measurementSummary.waist.previousDelta, 'cm')}
					</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">Hips</p>
					<p class="font-semibold">{formatNumber(dashboard.measurementSummary.hips.current)} cm</p>
					<p class="text-muted-foreground text-xs">
						{deltaLabel(dashboard.measurementSummary.hips.previousDelta, 'cm')}
					</p>
				</div>
			</div>
		</div>
	</Card>

	<div
		class="fixed inset-x-0 bottom-20 z-20 mx-auto w-full max-w-(--mobile-shell-max-width) px-3 sm:px-4"
	>
		<div
			class="bg-background/95 grid grid-cols-2 gap-2 rounded-lg border p-2 shadow-lg backdrop-blur"
		>
			<LinkButton href={entryHref} class="w-full">
				<Plus size={16} aria-hidden="true" />
				Weight
			</LinkButton>
			<LinkButton href={measurementHref} variant="secondary" class="w-full">
				<Ruler size={16} aria-hidden="true" />
				Measurements
			</LinkButton>
		</div>
	</div>
</section>
