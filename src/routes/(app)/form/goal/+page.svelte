<script lang="ts">
	import { GoalRevisionPage } from '$lib/features/weight-form';
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

<GoalRevisionPage data={data.weightForm} action={form} />
