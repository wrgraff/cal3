<script lang="ts">
	import { WeightEntryPage } from '$lib/features/weight-form';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Add weight | cal3</title>
	<meta name="description" content="Add or update a daily weight entry." />
</svelte:head>

<WeightEntryPage data={data.weightForm} initialDate={data.initialDate} action={form} />
