<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, Minus, Plus } from '@lucide/svelte';

	import { Button, Input, Label, LinkButton } from '$lib/components/ui';

	import type { WeightTrackingActionData } from '$lib/features/weight-tracking';
	import { isIsoDate, todayIso } from '$lib/features/weight-tracking';

	interface Props {
		initialDate?: string;
		initialChestCm?: string;
		initialWaistCm?: string;
		initialHipsCm?: string;
		action?: WeightTrackingActionData | null;
	}

	let {
		initialDate = todayIso(),
		initialChestCm = '',
		initialWaistCm = '',
		initialHipsCm = '',
		action = null
	}: Props = $props();

	let selectedMeasurementDate = $state(todayIso());
	let initialDateApplied = $state(false);
	let initialValuesApplied = $state(false);
	let savingMeasurement = $state(false);
	let chestCm = $state('');
	let waistCm = $state('');
	let hipsCm = $state('');

	$effect(() => {
		if (initialDateApplied) return;
		selectedMeasurementDate = isIsoDate(initialDate) ? initialDate : todayIso();
		initialDateApplied = true;
	});

	$effect(() => {
		const actionValues = action?.bodyMeasurement?.values;
		if (actionValues) {
			selectedMeasurementDate = actionValues.date;
			chestCm = actionValues.chestCm;
			waistCm = actionValues.waistCm;
			hipsCm = actionValues.hipsCm;
			return;
		}

		if (!initialValuesApplied) {
			chestCm = initialChestCm;
			waistCm = initialWaistCm;
			hipsCm = initialHipsCm;
			initialValuesApplied = true;
		}
	});

	const enhanceMeasurementForm: SubmitFunction = () => {
		savingMeasurement = true;
		return async ({ update }) => {
			try {
				await update({ reset: false });
			} finally {
				savingMeasurement = false;
			}
		};
	};

	function adjustMeasurement(field: 'chest' | 'waist' | 'hips', step: 0.5 | -0.5): void {
		const currentRaw = field === 'chest' ? chestCm : field === 'waist' ? waistCm : hipsCm;
		const parsedValue = Number(currentRaw);
		const currentValue = Number.isFinite(parsedValue) ? parsedValue : 0;
		const nextValue = Math.max(0, Math.round((currentValue + step) * 10) / 10);
		const normalized = `${nextValue}`;

		if (field === 'chest') chestCm = normalized;
		if (field === 'waist') waistCm = normalized;
		if (field === 'hips') hipsCm = normalized;
	}
</script>

<section class="space-y-5" aria-labelledby="body-measurement-heading">
	<header class="relative flex min-h-9 items-center justify-center">
		<LinkButton href="/shape" variant="ghost" size="sm" class="absolute left-0">
			<ArrowLeft size={16} aria-hidden="true" />
			Back
		</LinkButton>
		<p id="body-measurement-heading" class="text-sm font-medium">Update measurements</p>
	</header>

	<div class="space-y-4">
		<form
			method="POST"
			action="?/upsertBodyMeasurement"
			class="space-y-4"
			novalidate
			use:enhance={enhanceMeasurementForm}
		>
			<div class="space-y-1.5">
				<div class="space-y-1.5">
					<Label for="measurement-date">Date</Label>
					<Input
						id="measurement-date"
						name="date"
						type="date"
						value={selectedMeasurementDate}
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
			</div>

			<div class="grid gap-3 sm:grid-cols-3">
				<div class="space-y-1.5">
					<Label for="chest-cm">Chest</Label>
					<div class="grid grid-cols-[1fr_auto_auto] gap-2">
						<Input
							id="chest-cm"
							name="chestCm"
							type="number"
							step="0.5"
							min="0"
							bind:value={chestCm}
							placeholder="cm"
							invalid={Boolean(action?.bodyMeasurement?.fieldErrors?.chestCm)}
							aria-describedby={action?.bodyMeasurement?.fieldErrors?.chestCm
								? 'chest-cm-error'
								: undefined}
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Decrease chest by 0.5 cm"
							onclick={() => adjustMeasurement('chest', -0.5)}
						>
							<Minus size={16} aria-hidden="true" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Increase chest by 0.5 cm"
							onclick={() => adjustMeasurement('chest', 0.5)}
						>
							<Plus size={16} aria-hidden="true" />
						</Button>
					</div>
					{#if action?.bodyMeasurement?.fieldErrors?.chestCm}
						<p id="chest-cm-error" class="text-destructive text-xs">
							{action.bodyMeasurement.fieldErrors.chestCm}
						</p>
					{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="waist-cm">Waist</Label>
					<div class="grid grid-cols-[1fr_auto_auto] gap-2">
						<Input
							id="waist-cm"
							name="waistCm"
							type="number"
							step="0.5"
							min="0"
							bind:value={waistCm}
							placeholder="cm"
							invalid={Boolean(action?.bodyMeasurement?.fieldErrors?.waistCm)}
							aria-describedby={action?.bodyMeasurement?.fieldErrors?.waistCm
								? 'waist-cm-error'
								: undefined}
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Decrease waist by 0.5 cm"
							onclick={() => adjustMeasurement('waist', -0.5)}
						>
							<Minus size={16} aria-hidden="true" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Increase waist by 0.5 cm"
							onclick={() => adjustMeasurement('waist', 0.5)}
						>
							<Plus size={16} aria-hidden="true" />
						</Button>
					</div>
					{#if action?.bodyMeasurement?.fieldErrors?.waistCm}
						<p id="waist-cm-error" class="text-destructive text-xs">
							{action.bodyMeasurement.fieldErrors.waistCm}
						</p>
					{/if}
				</div>
				<div class="space-y-1.5">
					<Label for="hips-cm">Hips</Label>
					<div class="grid grid-cols-[1fr_auto_auto] gap-2">
						<Input
							id="hips-cm"
							name="hipsCm"
							type="number"
							step="0.5"
							min="0"
							bind:value={hipsCm}
							placeholder="cm"
							invalid={Boolean(action?.bodyMeasurement?.fieldErrors?.hipsCm)}
							aria-describedby={action?.bodyMeasurement?.fieldErrors?.hipsCm
								? 'hips-cm-error'
								: undefined}
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Decrease hips by 0.5 cm"
							onclick={() => adjustMeasurement('hips', -0.5)}
						>
							<Minus size={16} aria-hidden="true" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Increase hips by 0.5 cm"
							onclick={() => adjustMeasurement('hips', 0.5)}
						>
							<Plus size={16} aria-hidden="true" />
						</Button>
					</div>
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
			<div class="flex justify-center">
				<Button type="submit" size="lg" class="min-w-44" loading={savingMeasurement}>
					Update measurements
				</Button>
			</div>
		</form>
	</div>
</section>
