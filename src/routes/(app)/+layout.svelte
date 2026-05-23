<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MobileShell } from '$lib/features/mobile-shell';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<MobileShell>
	{@render children()}
</MobileShell>
