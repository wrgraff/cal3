<script lang="ts">
	import { BodyMeasurementPage } from '$lib/features/body-measurements';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Add measurements | cal3</title>
	<meta name="description" content="Add or update body measurements." />
</svelte:head>

<BodyMeasurementPage data={data.weightTracking} initialDate={data.initialDate} action={form} />
