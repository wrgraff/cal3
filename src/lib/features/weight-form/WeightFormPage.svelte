<script lang="ts">
	import {
		CalendarDays,
		ChevronLeft,
		ChevronRight,
		Flag,
		Plus,
		Ruler,
		Scale,
		Settings2
	} from '@lucide/svelte';

	import { Button, Card, Input, Label } from '$lib/components/ui';

	import MeasurementsChart from './MeasurementsChart.svelte';
	import WeightChart from './WeightChart.svelte';
	import type {
		BodyMeasurement,
		BodyMeasurementFormValues,
		ChartRange,
		WeightEntry,
		WeightEntryFormValues,
		WeightFormActionData,
		WeightFormData,
		WeightGoalFormValues,
		WeightTag
	} from './weight-form.types';
	import { WEIGHT_TAGS } from './weight-form.types';
	import {
		DEFAULT_WEEKLY_LOSS_KG,
		STATUS_LABELS,
		TAG_LABELS,
		addDays,
		calculateTargetDate,
		deriveWeightDashboard,
		formatNumber,
		prettyDate,
		todayIso
	} from './weight-form.utils';

	interface Props {
		data: WeightFormData;
		action?: WeightFormActionData | null;
	}

	let { data, action = null }: Props = $props();

	let selectedDate = $state(getInitialSelectedDate());
	let selectedMeasurementDate = $state(getInitialSelectedMeasurementDate());
	let chartRange = $state<ChartRange>('goal');

	const dashboard = $derived(deriveWeightDashboard(data));
	const selectedEntry = $derived(data.entries.find((entry) => entry.date === selectedDate) ?? null);
	const selectedMeasurement = $derived(
		data.measurements.find((measurement) => measurement.date === selectedMeasurementDate) ?? null
	);
	const weightValues = $derived(
		getWeightValues(action?.weightEntry?.values, selectedDate, selectedEntry)
	);
	const measurementValues = $derived(
		getMeasurementValues(
			action?.bodyMeasurement?.values,
			selectedMeasurementDate,
			selectedMeasurement
		)
	);
	const goalValues = $derived(getGoalValues(action?.goal?.values));
	const projectedTargetDate = $derived(getProjectedTargetDate(goalValues));

	function getInitialSelectedDate(): string {
		return todayIso();
	}

	function getInitialSelectedMeasurementDate(): string {
		return todayIso();
	}

	function getWeightValues(
		actionValues: WeightEntryFormValues | undefined,
		date: string,
		entry: WeightEntry | null
	): WeightEntryFormValues {
		if (actionValues) return actionValues;
		return {
			date,
			morningWeightKg: entry?.morningWeightKg?.toString() ?? '',
			eveningWeightKg: entry?.eveningWeightKg?.toString() ?? '',
			tags: entry?.tags ?? []
		};
	}

	function getMeasurementValues(
		actionValues: BodyMeasurementFormValues | undefined,
		date: string,
		measurement: BodyMeasurement | null
	): BodyMeasurementFormValues {
		if (actionValues) return actionValues;
		return {
			date,
			chestCm: measurement?.chestCm?.toString() ?? '',
			waistCm: measurement?.waistCm?.toString() ?? '',
			hipsCm: measurement?.hipsCm?.toString() ?? ''
		};
	}

	function getGoalValues(actionValues: WeightGoalFormValues | undefined): WeightGoalFormValues {
		if (actionValues) return actionValues;
		return {
			startDate: dashboard.currentDate,
			startWeightKg:
				dashboard.summary.currentWeightKg?.toFixed(1) ??
				dashboard.activeGoal?.startWeightKg.toString() ??
				'',
			targetWeightKg: dashboard.activeGoal?.targetWeightKg.toString() ?? ''
		};
	}

	function getProjectedTargetDate(values: WeightGoalFormValues): string | null {
		const startWeightKg = Number(values.startWeightKg);
		const targetWeightKg = Number(values.targetWeightKg);
		if (!values.startDate || !Number.isFinite(startWeightKg) || !Number.isFinite(targetWeightKg))
			return null;
		if (targetWeightKg <= 0 || startWeightKg <= 0 || targetWeightKg >= startWeightKg) return null;
		return calculateTargetDate({
			startDate: values.startDate,
			startWeightKg,
			targetWeightKg,
			weeklyLossKg: DEFAULT_WEEKLY_LOSS_KG
		});
	}

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

<section class="space-y-5" aria-labelledby="form-heading">
	<header class="space-y-3">
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Today</p>
				<h2 id="form-heading" class="text-2xl font-semibold tracking-tight">Form</h2>
			</div>
			<div class="flex items-center gap-1" aria-label="Selected date controls">
				<Button
					size="icon"
					variant="ghost"
					aria-label="Previous day"
					onclick={() => (selectedDate = addDays(selectedDate, -1))}
				>
					<ChevronLeft size={18} aria-hidden="true" />
				</Button>
				<div
					class="bg-secondary text-secondary-foreground flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
				>
					<CalendarDays size={16} aria-hidden="true" />
					<span>{prettyDate(selectedDate, true)}</span>
				</div>
				<Button
					size="icon"
					variant="ghost"
					aria-label="Next day"
					onclick={() => (selectedDate = addDays(selectedDate, 1))}
				>
					<ChevronRight size={18} aria-hidden="true" />
				</Button>
			</div>
		</div>

		{#if action?.message}
			<p class="bg-success text-success-foreground rounded-md px-3 py-2 text-sm" role="status">
				{action.message}
			</p>
		{/if}
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
				{#each ['7d', '30d', 'goal', '1y'] as rangeOption}
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

	<div class="grid gap-4">
		<Card class="space-y-4 p-4">
			<div class="flex items-center gap-2">
				<Plus size={18} aria-hidden="true" />
				<h3 class="text-base font-semibold">Add weight</h3>
			</div>
			<form method="POST" action="?/upsertWeightEntry" class="space-y-4" novalidate>
				<div class="grid gap-3 sm:grid-cols-3">
					<div class="space-y-1.5">
						<Label for="weight-date">Date</Label>
						<Input
							id="weight-date"
							name="date"
							type="date"
							value={weightValues.date}
							invalid={Boolean(action?.weightEntry?.fieldErrors?.date)}
							aria-describedby={action?.weightEntry?.fieldErrors?.date
								? 'weight-date-error'
								: undefined}
							onchange={(event) => (selectedDate = event.currentTarget.value)}
						/>
						{#if action?.weightEntry?.fieldErrors?.date}
							<p id="weight-date-error" class="text-destructive text-xs">
								{action.weightEntry.fieldErrors.date}
							</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="morning-weight">Morning weight</Label>
						<Input
							id="morning-weight"
							name="morningWeightKg"
							type="number"
							step="0.05"
							min="0"
							value={weightValues.morningWeightKg}
							placeholder="kg"
							invalid={Boolean(action?.weightEntry?.fieldErrors?.morningWeightKg)}
							aria-describedby={action?.weightEntry?.fieldErrors?.morningWeightKg
								? 'morning-weight-error'
								: undefined}
						/>
						{#if action?.weightEntry?.fieldErrors?.morningWeightKg}
							<p id="morning-weight-error" class="text-destructive text-xs">
								{action.weightEntry.fieldErrors.morningWeightKg}
							</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="evening-weight">Evening weight</Label>
						<Input
							id="evening-weight"
							name="eveningWeightKg"
							type="number"
							step="0.05"
							min="0"
							value={weightValues.eveningWeightKg}
							placeholder="kg"
							invalid={Boolean(action?.weightEntry?.fieldErrors?.eveningWeightKg)}
							aria-describedby={action?.weightEntry?.fieldErrors?.eveningWeightKg
								? 'evening-weight-error'
								: undefined}
						/>
						{#if action?.weightEntry?.fieldErrors?.eveningWeightKg}
							<p id="evening-weight-error" class="text-destructive text-xs">
								{action.weightEntry.fieldErrors.eveningWeightKg}
							</p>
						{/if}
					</div>
				</div>

				<fieldset class="space-y-2">
					<legend class="text-sm font-medium">Tags</legend>
					<div class="flex flex-wrap gap-2">
						{#each WEIGHT_TAGS as tag}
							<label class="cursor-pointer">
								<input
									class="peer sr-only"
									type="checkbox"
									name="tags"
									value={tag}
									checked={weightValues.tags.includes(tag as WeightTag)}
								/>
								<span
									class="border-input peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-ring inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:outline-none"
								>
									{TAG_LABELS[tag]}
								</span>
							</label>
						{/each}
					</div>
				</fieldset>

				{#if action?.weightEntry?.formError}
					<p class="text-destructive text-sm" role="alert">
						{action.weightEntry.formError}
					</p>
				{/if}

				<div class="flex flex-wrap items-center justify-between gap-2">
					{#if selectedEntry}
						<p class="text-muted-foreground text-xs">
							Editing existing entry for {prettyDate(selectedEntry.date, true)}.
						</p>
					{:else}
						<p class="text-muted-foreground text-xs">
							At least one weight value is required; evening weight is secondary.
						</p>
					{/if}
					<Button type="submit">Save weight</Button>
				</div>
			</form>
			{#if selectedEntry}
				<form method="POST" action="?/deleteWeightEntry">
					<input type="hidden" name="id" value={selectedEntry.id} />
					<Button type="submit" variant="destructive" size="sm">Delete selected weight entry</Button
					>
				</form>
			{/if}
		</Card>

		<Card class="space-y-4 p-4">
			<div class="flex items-center gap-2">
				<Ruler size={18} aria-hidden="true" />
				<h3 class="text-base font-semibold">Add measurement</h3>
			</div>
			<form method="POST" action="?/upsertBodyMeasurement" class="space-y-4" novalidate>
				<div class="grid gap-3 sm:grid-cols-4">
					<div class="space-y-1.5">
						<Label for="measurement-date">Date</Label>
						<Input
							id="measurement-date"
							name="date"
							type="date"
							value={measurementValues.date}
							invalid={Boolean(action?.bodyMeasurement?.fieldErrors?.date)}
							aria-describedby={action?.bodyMeasurement?.fieldErrors?.date
								? 'measurement-date-error'
								: undefined}
							onchange={(event) => (selectedMeasurementDate = event.currentTarget.value)}
						/>
						{#if action?.bodyMeasurement?.fieldErrors?.date}
							<p id="measurement-date-error" class="text-destructive text-xs">
								{action.bodyMeasurement.fieldErrors.date}
							</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="chest-cm">Chest</Label>
						<Input
							id="chest-cm"
							name="chestCm"
							type="number"
							step="0.5"
							min="0"
							value={measurementValues.chestCm}
							placeholder="cm"
							invalid={Boolean(action?.bodyMeasurement?.fieldErrors?.chestCm)}
							aria-describedby={action?.bodyMeasurement?.fieldErrors?.chestCm
								? 'chest-cm-error'
								: undefined}
						/>
						{#if action?.bodyMeasurement?.fieldErrors?.chestCm}
							<p id="chest-cm-error" class="text-destructive text-xs">
								{action.bodyMeasurement.fieldErrors.chestCm}
							</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="waist-cm">Waist</Label>
						<Input
							id="waist-cm"
							name="waistCm"
							type="number"
							step="0.5"
							min="0"
							value={measurementValues.waistCm}
							placeholder="cm"
							invalid={Boolean(action?.bodyMeasurement?.fieldErrors?.waistCm)}
							aria-describedby={action?.bodyMeasurement?.fieldErrors?.waistCm
								? 'waist-cm-error'
								: undefined}
						/>
						{#if action?.bodyMeasurement?.fieldErrors?.waistCm}
							<p id="waist-cm-error" class="text-destructive text-xs">
								{action.bodyMeasurement.fieldErrors.waistCm}
							</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="hips-cm">Hips</Label>
						<Input
							id="hips-cm"
							name="hipsCm"
							type="number"
							step="0.5"
							min="0"
							value={measurementValues.hipsCm}
							placeholder="cm"
							invalid={Boolean(action?.bodyMeasurement?.fieldErrors?.hipsCm)}
							aria-describedby={action?.bodyMeasurement?.fieldErrors?.hipsCm
								? 'hips-cm-error'
								: undefined}
						/>
						{#if action?.bodyMeasurement?.fieldErrors?.hipsCm}
							<p id="hips-cm-error" class="text-destructive text-xs">
								{action.bodyMeasurement.fieldErrors.hipsCm}
							</p>
						{/if}
					</div>
				</div>
				{#if action?.bodyMeasurement?.formError}
					<p class="text-destructive text-sm" role="alert">
						{action.bodyMeasurement.formError}
					</p>
				{/if}
				<div class="flex justify-end"><Button type="submit">Save measurement</Button></div>
			</form>
			{#if selectedMeasurement}
				<form method="POST" action="?/deleteBodyMeasurement">
					<input type="hidden" name="id" value={selectedMeasurement.id} />
					<Button type="submit" variant="destructive" size="sm">Delete selected measurement</Button>
				</form>
			{/if}
		</Card>

		<Card class="space-y-4 p-4">
			<div class="flex items-center gap-2">
				<Flag size={18} aria-hidden="true" />
				<h3 class="text-base font-semibold">Goal settings</h3>
			</div>
			<form method="POST" action="?/createGoalRevision" class="space-y-4" novalidate>
				<div class="grid gap-3 sm:grid-cols-3">
					<div class="space-y-1.5">
						<Label for="goal-start-date">Start date</Label>
						<Input
							id="goal-start-date"
							name="startDate"
							type="date"
							value={goalValues.startDate}
							invalid={Boolean(action?.goal?.fieldErrors?.startDate)}
							aria-describedby={action?.goal?.fieldErrors?.startDate
								? 'goal-start-date-error'
								: undefined}
						/>
						{#if action?.goal?.fieldErrors?.startDate}
							<p id="goal-start-date-error" class="text-destructive text-xs">
								{action.goal.fieldErrors.startDate}
							</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="goal-start-weight">Start weight</Label>
						<Input
							id="goal-start-weight"
							name="startWeightKg"
							type="number"
							step="0.05"
							min="0"
							value={goalValues.startWeightKg}
							placeholder="kg"
							invalid={Boolean(action?.goal?.fieldErrors?.startWeightKg)}
							aria-describedby={action?.goal?.fieldErrors?.startWeightKg
								? 'goal-start-weight-error'
								: undefined}
						/>
						{#if action?.goal?.fieldErrors?.startWeightKg}
							<p id="goal-start-weight-error" class="text-destructive text-xs">
								{action.goal.fieldErrors.startWeightKg}
							</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="goal-target-weight">Target weight</Label>
						<Input
							id="goal-target-weight"
							name="targetWeightKg"
							type="number"
							step="0.5"
							min="0"
							value={goalValues.targetWeightKg}
							placeholder="kg"
							invalid={Boolean(action?.goal?.fieldErrors?.targetWeightKg)}
							aria-describedby={action?.goal?.fieldErrors?.targetWeightKg
								? 'goal-target-weight-error'
								: undefined}
						/>
						{#if action?.goal?.fieldErrors?.targetWeightKg}
							<p id="goal-target-weight-error" class="text-destructive text-xs">
								{action.goal.fieldErrors.targetWeightKg}
							</p>
						{/if}
					</div>
				</div>
				<div class="bg-secondary text-secondary-foreground rounded-md p-3 text-sm">
					<Settings2 class="mr-1 inline" size={16} aria-hidden="true" />
					Weekly loss is fixed at {DEFAULT_WEEKLY_LOSS_KG.toFixed(2)} kg/week. Projected target date:
					{prettyDate(projectedTargetDate, true)}.
				</div>
				{#if action?.goal?.formError}
					<p class="text-destructive text-sm" role="alert">
						{action.goal.formError}
					</p>
				{/if}
				<div class="flex justify-end"><Button type="submit">Save goal revision</Button></div>
			</form>
		</Card>
	</div>

	<Card class="space-y-4 p-4">
		<h3 class="text-base font-semibold">History</h3>
		<div class="space-y-5">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<caption class="sr-only">Weight entry history</caption>
					<thead class="text-muted-foreground border-b text-xs">
						<tr
							><th class="py-2 pr-3">Date</th><th class="py-2 pr-3">Morning</th><th
								class="py-2 pr-3">Evening</th
							><th class="py-2">Tags</th></tr
						>
					</thead>
					<tbody class="divide-y">
						{#each dashboard.entries as entry}
							<tr>
								<td class="py-2 pr-3"
									><button
										type="button"
										class="text-primary underline-offset-4 hover:underline"
										onclick={() => (selectedDate = entry.date)}>{prettyDate(entry.date)}</button
									></td
								>
								<td class="py-2 pr-3">{formatNumber(entry.morningWeightKg)}</td>
								<td class="py-2 pr-3">{formatNumber(entry.eveningWeightKg)}</td>
								<td class="py-2">{entry.tags.map((tag) => TAG_LABELS[tag]).join(', ') || '—'}</td>
							</tr>
						{:else}
							<tr
								><td colspan="4" class="text-muted-foreground py-6 text-center"
									>No weight entries yet.</td
								></tr
							>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<caption class="sr-only">Body measurement history</caption>
					<thead class="text-muted-foreground border-b text-xs">
						<tr
							><th class="py-2 pr-3">Date</th><th class="py-2 pr-3">Chest</th><th class="py-2 pr-3"
								>Waist</th
							><th class="py-2">Hips</th></tr
						>
					</thead>
					<tbody class="divide-y">
						{#each dashboard.measurements as measurement}
							<tr>
								<td class="py-2 pr-3"
									><button
										type="button"
										class="text-primary underline-offset-4 hover:underline"
										onclick={() => (selectedMeasurementDate = measurement.date)}
										>{prettyDate(measurement.date)}</button
									></td
								>
								<td class="py-2 pr-3">{formatNumber(measurement.chestCm)}</td>
								<td class="py-2 pr-3">{formatNumber(measurement.waistCm)}</td>
								<td class="py-2">{formatNumber(measurement.hipsCm)}</td>
							</tr>
						{:else}
							<tr
								><td colspan="4" class="text-muted-foreground py-6 text-center"
									>No measurements yet.</td
								></tr
							>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</Card>
</section>
