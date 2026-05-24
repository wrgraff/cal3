<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Flag, Settings2 } from '@lucide/svelte';

	import { Button, Card, Input, Label, LinkButton } from '$lib/components/ui';

	import type {
		WeightTrackingActionData,
		WeightTrackingData,
		WeightGoalFormValues
	} from '$lib/features/weight-tracking';
	import {
		DEFAULT_WEEKLY_LOSS_KG,
		calculateTargetDate,
		deriveWeightDashboard,
		prettyDate
	} from '$lib/features/weight-tracking';

	interface Props {
		data: WeightTrackingData;
		action?: WeightTrackingActionData | null;
	}

	let { data, action = null }: Props = $props();

	let savingGoal = $state(false);

	const dashboard = $derived(deriveWeightDashboard(data));
	const goalValues = $derived(getGoalValues(action?.goal?.values));
	const projectedTargetDate = $derived(getProjectedTargetDate(goalValues));

	const enhanceGoalForm: SubmitFunction = () => {
		savingGoal = true;
		return async ({ update }) => {
			try {
				await update({ reset: false });
			} finally {
				savingGoal = false;
			}
		};
	};

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
		if (!values.startDate || !Number.isFinite(startWeightKg) || !Number.isFinite(targetWeightKg)) {
			return null;
		}
		if (targetWeightKg <= 0 || startWeightKg <= 0 || targetWeightKg >= startWeightKg) return null;
		return calculateTargetDate({
			startDate: values.startDate,
			startWeightKg,
			targetWeightKg,
			weeklyLossKg: DEFAULT_WEEKLY_LOSS_KG
		});
	}
</script>

<section class="space-y-5" aria-labelledby="goal-revision-heading">
	<header class="space-y-3">
		<LinkButton href="/shape" variant="ghost" size="sm">Back to Shape</LinkButton>
		<div>
			<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Progress</p>
			<h2 id="goal-revision-heading" class="text-2xl font-semibold tracking-tight">
				Goal settings
			</h2>
		</div>

		{#if action?.message}
			<p class="bg-success text-success-foreground rounded-md px-3 py-2 text-sm" role="status">
				{action.message}
			</p>
		{/if}
	</header>

	<Card class="space-y-4 p-4">
		<div class="flex items-center gap-2">
			<Flag size={18} aria-hidden="true" />
			<h3 class="text-base font-semibold">Update goal</h3>
		</div>
		<form
			method="POST"
			action="?/createGoalRevision"
			class="space-y-4"
			novalidate
			use:enhance={enhanceGoalForm}
		>
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
				Weekly loss is fixed at {DEFAULT_WEEKLY_LOSS_KG.toFixed(2)} kg/week. Projected target date: {prettyDate(
					projectedTargetDate,
					true
				)}.
			</div>
			{#if action?.goal?.formError}
				<p class="text-destructive text-sm" role="alert">
					{action.goal.formError}
				</p>
			{/if}
			<div class="flex justify-end">
				<Button type="submit" loading={savingGoal}>Save goal revision</Button>
			</div>
		</form>
	</Card>
</section>
