<script lang="ts">
	import { CalendarDays, ChevronLeft, ChevronRight, Ruler } from '@lucide/svelte';

	import { Button, Card, Input, Label, LinkButton } from '$lib/components/ui';

	import type {
		BodyMeasurement,
		BodyMeasurementFormValues,
		WeightFormActionData,
		WeightFormData
	} from './weight-form.types';
	import { addDays, isIsoDate, prettyDate, todayIso } from './weight-form.utils';

	interface Props {
		data: WeightFormData;
		initialDate?: string;
		action?: WeightFormActionData | null;
	}

	let { data, initialDate = todayIso(), action = null }: Props = $props();

	let selectedMeasurementDate = $state(todayIso());
	let initialDateApplied = $state(false);

	const selectedMeasurement = $derived(
		data.measurements.find((measurement) => measurement.date === selectedMeasurementDate) ?? null
	);
	const measurementValues = $derived(
		getMeasurementValues(
			action?.bodyMeasurement?.values,
			selectedMeasurementDate,
			selectedMeasurement
		)
	);

	$effect(() => {
		if (initialDateApplied) return;
		selectedMeasurementDate = isIsoDate(initialDate) ? initialDate : todayIso();
		initialDateApplied = true;
	});

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
</script>

<section class="space-y-5" aria-labelledby="body-measurement-heading">
	<header class="space-y-3">
		<LinkButton href="/form" variant="ghost" size="sm">Back to Form</LinkButton>
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					Measurements
				</p>
				<h2 id="body-measurement-heading" class="text-2xl font-semibold tracking-tight">
					Add measurements
				</h2>
			</div>
			<div class="flex items-center gap-1" aria-label="Selected date controls">
				<Button
					size="icon"
					variant="ghost"
					aria-label="Previous day"
					onclick={() => (selectedMeasurementDate = addDays(selectedMeasurementDate, -1))}
				>
					<ChevronLeft size={18} aria-hidden="true" />
				</Button>
				<div
					class="bg-secondary text-secondary-foreground flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium"
				>
					<CalendarDays size={16} aria-hidden="true" />
					<span>{prettyDate(selectedMeasurementDate, true)}</span>
				</div>
				<Button
					size="icon"
					variant="ghost"
					aria-label="Next day"
					onclick={() => (selectedMeasurementDate = addDays(selectedMeasurementDate, 1))}
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

	<Card class="space-y-4 p-4">
		<div class="flex items-center gap-2">
			<Ruler size={18} aria-hidden="true" />
			<h3 class="text-base font-semibold">Body measurements</h3>
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
			<div class="flex justify-end"><Button type="submit">Save measurements</Button></div>
		</form>
		{#if selectedMeasurement}
			<form method="POST" action="?/deleteBodyMeasurement">
				<input type="hidden" name="id" value={selectedMeasurement.id} />
				<Button type="submit" variant="destructive" size="sm">Delete selected measurements</Button>
			</form>
		{/if}
	</Card>
</section>
