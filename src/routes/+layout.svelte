<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { onMount } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Eagerly register the PWA service worker on the client. The lazy import keeps
	// the registration code out of SSR (which has no `window`).
	onMount(async () => {
		if (import.meta.env.DEV && 'serviceWorker' in navigator) {
			const registrations = await navigator.serviceWorker.getRegistrations();
			await Promise.all(registrations.map((registration) => registration.unregister()));
		}

		if (pwaInfo && !import.meta.env.DEV) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		}
	});
</script>

<svelte:head>
	{#if pwaInfo}
		<link
			rel="manifest"
			href={pwaInfo.webManifest.href}
			crossorigin={pwaInfo.webManifest.useCredentials ? 'use-credentials' : undefined}
		/>
	{/if}
</svelte:head>

<div class="min-h-dvh">
	{@render children()}
</div>
