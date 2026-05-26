<script lang="ts">
	import { page } from '$app/state';
	import { WeightEntryPage } from '$lib/features/weight-entry';
	import { isIsoDate, todayIso } from '$lib/features/weight-tracking';
	import type { ActionData } from './$types';

	interface Props {
		form?: ActionData;
	}

	let { form }: Props = $props();

	function parseInitialWeight(url: URL): string {
		const value = url.searchParams.get('currentWeightKg');
		const parsed = value == null ? NaN : Number(value);
		return Number.isFinite(parsed) && parsed > 0 ? `${parsed}` : '';
	}

	const initialDate = $derived(
		isIsoDate(page.url.searchParams.get('date') ?? '')
			? (page.url.searchParams.get('date') as string)
			: todayIso()
	);
	const initialWeightKg = $derived(parseInitialWeight(page.url));
</script>

<svelte:head>
	<title>Add weight | cal3</title>
	<meta name="description" content="Add or update a daily weight entry." />
</svelte:head>

<WeightEntryPage {initialDate} {initialWeightKg} action={form} />
