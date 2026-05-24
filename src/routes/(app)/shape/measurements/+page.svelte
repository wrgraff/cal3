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
	<title>Update measurements | cal3</title>
	<meta name="description" content="Update body measurements." />
</svelte:head>

<BodyMeasurementPage
	initialDate={data.initialDate}
	initialChestCm={data.initialChestCm}
	initialWaistCm={data.initialWaistCm}
	initialHipsCm={data.initialHipsCm}
	action={form}
/>
