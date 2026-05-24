<script lang="ts">
	import { History } from '@lucide/svelte';

	import { Card, LinkButton } from '$lib/components/ui';

	import type { WeightTrackingData } from '$lib/features/weight-tracking';
	import {
		TAG_LABELS,
		deriveWeightDashboard,
		formatNumber,
		prettyDate
	} from '$lib/features/weight-tracking';

	interface Props {
		data: WeightTrackingData;
	}

	let { data }: Props = $props();

	const dashboard = $derived(deriveWeightDashboard(data));
</script>

<section class="space-y-5" aria-labelledby="history-heading">
	<header class="space-y-3">
		<LinkButton href="/shape" variant="ghost" size="sm">Back to Shape</LinkButton>
		<div class="flex items-center gap-2">
			<History size={22} aria-hidden="true" />
			<div>
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Shape</p>
				<h2 id="history-heading" class="text-2xl font-semibold tracking-tight">History</h2>
			</div>
		</div>
	</header>

	<Card class="space-y-4 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold">Weight entries</h3>
			<LinkButton href="/shape/weight" variant="outline" size="sm">Add weight</LinkButton>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<caption class="sr-only">Weight entry history</caption>
				<thead class="text-muted-foreground border-b text-xs">
					<tr
						><th class="py-2 pr-3">Date</th><th class="py-2 pr-3">Morning</th><th class="py-2 pr-3"
							>Evening</th
						><th class="py-2">Tags</th></tr
					>
				</thead>
				<tbody class="divide-y">
					{#each dashboard.entries as entry}
						<tr>
							<td class="py-2 pr-3">
								<a
									href={`/shape/weight?date=${entry.date}`}
									class="text-primary underline-offset-4 hover:underline"
								>
									{prettyDate(entry.date)}
								</a>
							</td>
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
	</Card>

	<Card class="space-y-4 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold">Body measurements</h3>
			<LinkButton href="/shape/measurements" variant="outline" size="sm"
				>Add measurements</LinkButton
			>
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
							<td class="py-2 pr-3">
								<a
									href={`/shape/measurements?date=${measurement.date}`}
									class="text-primary underline-offset-4 hover:underline"
								>
									{prettyDate(measurement.date)}
								</a>
							</td>
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
	</Card>

	<Card class="space-y-4 p-4">
		<div class="flex items-center justify-between gap-3">
			<h3 class="text-base font-semibold">Goals</h3>
			<LinkButton href="/shape/goal" variant="outline" size="sm">Update goal</LinkButton>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<caption class="sr-only">Weight goal history</caption>
				<thead class="text-muted-foreground border-b text-xs">
					<tr
						><th class="py-2 pr-3">Start</th><th class="py-2 pr-3">Start kg</th><th
							class="py-2 pr-3">Target kg</th
						><th class="py-2">Status</th></tr
					>
				</thead>
				<tbody class="divide-y">
					{#each dashboard.goals as goal}
						<tr>
							<td class="py-2 pr-3">{prettyDate(goal.startDate)}</td>
							<td class="py-2 pr-3">{formatNumber(goal.startWeightKg)}</td>
							<td class="py-2 pr-3">{formatNumber(goal.targetWeightKg)}</td>
							<td class="py-2 capitalize">{goal.status.replace('_', ' ')}</td>
						</tr>
					{:else}
						<tr
							><td colspan="4" class="text-muted-foreground py-6 text-center"
								>No goal revisions yet.</td
							></tr
						>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</section>
