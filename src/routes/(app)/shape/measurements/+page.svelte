<script lang="ts">
	import { page } from '$app/state';
	import { BodyMeasurementPage } from '$lib/features/body-measurements';
	import { isIsoDate, todayIso } from '$lib/features/weight-tracking';
	import type { ActionData } from './$types';

	interface Props {
		form?: ActionData;
	}

	let { form }: Props = $props();

	function parseInitialMeasurement(url: URL, key: 'chestCm' | 'waistCm' | 'hipsCm'): string {
		const value = url.searchParams.get(key);
		const parsed = value == null ? NaN : Number(value);
		return Number.isFinite(parsed) && parsed >= 0 ? `${parsed}` : '';
	}

	const initialDate = $derived(
		isIsoDate(page.url.searchParams.get('date') ?? '')
			? (page.url.searchParams.get('date') as string)
			: todayIso()
	);
	const initialChestCm = $derived(parseInitialMeasurement(page.url, 'chestCm'));
	const initialWaistCm = $derived(parseInitialMeasurement(page.url, 'waistCm'));
	const initialHipsCm = $derived(parseInitialMeasurement(page.url, 'hipsCm'));
</script>

<svelte:head>
	<title>Update measurements | cal³</title>
	<meta name="description" content="Update body measurements." />
</svelte:head>

<BodyMeasurementPage
	{initialDate}
	{initialChestCm}
	{initialWaistCm}
	{initialHipsCm}
	action={form}
/>
