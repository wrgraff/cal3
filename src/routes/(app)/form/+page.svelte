<script lang="ts">
	import { WeightFormPage } from '$lib/features/weight-form';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Form | cal3</title>
	<meta name="description" content="Weight and body measurements tracker." />
</svelte:head>

<WeightFormPage data={data.weightForm} action={form} />
