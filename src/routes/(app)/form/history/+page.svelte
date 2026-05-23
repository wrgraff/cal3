<script lang="ts">
	import { WeightHistoryPage } from '$lib/features/weight-history';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>History | cal3</title>
	<meta name="description" content="Weight, measurements, and goal history." />
</svelte:head>

<WeightHistoryPage data={data.weightTracking} />
