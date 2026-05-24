<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, Minus, Plus } from '@lucide/svelte';

	import { Button, Input, Label, LinkButton } from '$lib/components/ui';

	import type {
		WeightEntryFormValues,
		WeightTrackingActionData,
		WeightTag
	} from '$lib/features/weight-tracking';
	import { WEIGHT_TAGS } from '$lib/features/weight-tracking';
	import { TAG_LABELS, isIsoDate, todayIso } from '$lib/features/weight-tracking';

	interface Props {
		initialDate?: string;
		initialWeightKg?: string;
		action?: WeightTrackingActionData | null;
	}

	let { initialDate = todayIso(), initialWeightKg = '', action = null }: Props = $props();

	let selectedDate = $state(todayIso());
	let initialDateApplied = $state(false);
	let initialWeightApplied = $state(false);
	let savingWeight = $state(false);
	let weightKg = $state('');
	let timeOfDay = $state<WeightEntryFormValues['timeOfDay']>(defaultTimeOfDay());

	const selectedTags = $derived(action?.weightEntry?.values?.tags ?? []);

	$effect(() => {
		if (initialDateApplied) return;
		selectedDate = isIsoDate(initialDate) ? initialDate : todayIso();
		initialDateApplied = true;
	});

	$effect(() => {
		const actionValues = action?.weightEntry?.values;
		if (actionValues) {
			selectedDate = actionValues.date;
			weightKg = actionValues.weightKg;
			timeOfDay = actionValues.timeOfDay;
			return;
		}

		if (!initialWeightApplied) {
			weightKg = initialWeightKg;
			initialWeightApplied = true;
		}
	});

	const enhanceWeightForm: SubmitFunction = () => {
		savingWeight = true;
		return async ({ update }) => {
			try {
				await update({ reset: false });
			} finally {
				savingWeight = false;
			}
		};
	};

	function defaultTimeOfDay(date = new Date()): WeightEntryFormValues['timeOfDay'] {
		const hours = date.getHours();
		return hours >= 7 && hours <= 16 ? 'morning' : 'evening';
	}

	function adjustWeight(step: 0.01 | -0.01): void {
		const parsedValue = Number(weightKg);
		const currentValue = Number.isFinite(parsedValue) ? parsedValue : 0;
		const nextValue = Math.max(0, Math.round((currentValue + step) * 100) / 100);
		weightKg = nextValue.toFixed(2);
	}
</script>

<section class="space-y-5" aria-labelledby="weight-entry-heading">
	<header class="relative flex min-h-9 items-center justify-center">
		<LinkButton href="/shape" variant="ghost" size="sm" class="absolute left-0">
			<ArrowLeft size={16} aria-hidden="true" />
			Back
		</LinkButton>
		<p id="weight-entry-heading" class="text-sm font-medium">Update weight</p>
	</header>

	<div class="space-y-4">
		<form
			method="POST"
			action="?/upsertWeightEntry"
			class="space-y-4"
			novalidate
			use:enhance={enhanceWeightForm}
		>
			<div class="grid grid-cols-2 items-end gap-3">
				<div class="space-y-1.5">
					<Label for="weight-date">Date</Label>
					<Input
						id="weight-date"
						name="date"
						type="date"
						value={selectedDate}
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
					<p class="text-sm font-medium">Time of day</p>
					<div
						class="bg-secondary inline-flex rounded-md p-1"
						role="radiogroup"
						aria-label="Time of day"
					>
						<label>
							<input
								class="peer sr-only"
								type="radio"
								name="timeOfDay"
								value="morning"
								bind:group={timeOfDay}
							/>
							<span
								class="peer-checked:bg-background peer-checked:text-foreground text-muted-foreground inline-flex cursor-pointer rounded-sm px-3 py-1.5 text-sm font-medium shadow-sm"
							>
								Morning
							</span>
						</label>
						<label>
							<input
								class="peer sr-only"
								type="radio"
								name="timeOfDay"
								value="evening"
								bind:group={timeOfDay}
							/>
							<span
								class="peer-checked:bg-background peer-checked:text-foreground text-muted-foreground inline-flex cursor-pointer rounded-sm px-3 py-1.5 text-sm font-medium shadow-sm"
							>
								Evening
							</span>
						</label>
					</div>
				</div>
			</div>

			<div class="space-y-1.5">
				<Label for="weight-value" class="block text-center">Weight</Label>
				<div class="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="lg"
						aria-label="Decrease by 0.01 kg"
						onclick={() => adjustWeight(-0.01)}
					>
						<Minus size={18} aria-hidden="true" />
					</Button>
					<Input
						id="weight-value"
						name="weightKg"
						type="number"
						step="0.01"
						min="0"
						placeholder="kg"
						class="h-16 flex-1 text-center text-4xl font-semibold"
						bind:value={weightKg}
						invalid={Boolean(action?.weightEntry?.fieldErrors?.weightKg)}
						aria-describedby={action?.weightEntry?.fieldErrors?.weightKg
							? 'weight-value-error'
							: undefined}
					/>
					<Button
						type="button"
						variant="outline"
						size="lg"
						aria-label="Increase by 0.01 kg"
						onclick={() => adjustWeight(0.01)}
					>
						<Plus size={18} aria-hidden="true" />
					</Button>
				</div>
				{#if action?.weightEntry?.fieldErrors?.weightKg}
					<p id="weight-value-error" class="text-destructive text-xs">
						{action.weightEntry.fieldErrors.weightKg}
					</p>
				{/if}
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
								checked={selectedTags.includes(tag as WeightTag)}
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

			<div class="flex justify-center">
				<Button type="submit" size="lg" class="min-w-44" loading={savingWeight}>
					Update weight
				</Button>
			</div>
		</form>
	</div>
</section>
