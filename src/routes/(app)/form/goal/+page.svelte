<script lang="ts">
	import { WeightGoalPage } from '$lib/features/weight-goal';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<svelte:head>
	<title>Goal settings | cal3</title>
	<meta name="description" content="Update the active weight goal." />
</svelte:head>

<WeightGoalPage data={data.weightTracking} action={form} />
