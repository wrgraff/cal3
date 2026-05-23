<script lang="ts">
	import { CalendarDays, ChevronLeft, ChevronRight, Plus } from '@lucide/svelte';

	import { Button, Card, Input, Label, LinkButton } from '$lib/components/ui';

	import type {
		WeightEntry,
		WeightEntryFormValues,
		WeightFormActionData,
		WeightFormData,
		WeightTag
	} from './weight-form.types';
	import { WEIGHT_TAGS } from './weight-form.types';
	import { TAG_LABELS, addDays, isIsoDate, prettyDate, todayIso } from './weight-form.utils';

	interface Props {
		data: WeightFormData;
		initialDate?: string;
		action?: WeightFormActionData | null;
	}

	let { data, initialDate = todayIso(), action = null }: Props = $props();

	let selectedDate = $state(todayIso());
	let initialDateApplied = $state(false);

	const selectedEntry = $derived(data.entries.find((entry) => entry.date === selectedDate) ?? null);
	const weightValues = $derived(
		getWeightValues(action?.weightEntry?.values, selectedDate, selectedEntry)
	);

	$effect(() => {
		if (initialDateApplied) return;
		selectedDate = isIsoDate(initialDate) ? initialDate : todayIso();
		initialDateApplied = true;
	});

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
</script>

<section class="space-y-5" aria-labelledby="weight-entry-heading">
	<header class="space-y-3">
		<LinkButton href="/form" variant="ghost" size="sm">Back to Form</LinkButton>
		<div class="flex items-start justify-between gap-3">
			<div>
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Weight</p>
				<h2 id="weight-entry-heading" class="text-2xl font-semibold tracking-tight">Add weight</h2>
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

	<Card class="space-y-4 p-4">
		<div class="flex items-center gap-2">
			<Plus size={18} aria-hidden="true" />
			<h3 class="text-base font-semibold">Weight entry</h3>
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
				<Button type="submit" variant="destructive" size="sm">Delete selected weight entry</Button>
			</form>
		{/if}
	</Card>
</section>
