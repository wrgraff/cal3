<script lang="ts">
	import { WeightDashboardPage } from '$lib/features/weight-dashboard';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Shape | cal3</title>
	<meta name="description" content="Weight and body measurements tracker." />
</svelte:head>

<WeightDashboardPage data={data.weightTracking} />
