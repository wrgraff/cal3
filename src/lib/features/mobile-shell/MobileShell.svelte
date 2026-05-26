<script lang="ts">
	import { navigating, page } from '$app/state';
	import { Dumbbell, Loader2, Settings, Shirt, UtensilsCrossed } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { APP_TABS, getActiveTabId } from './mobile-shell.utils';
	import type { AppTab } from './mobile-shell.types';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const activeTabId = $derived(getActiveTabId(page.url.pathname));
	const pendingPathname = $derived(navigating.to?.url.pathname ?? null);
	const pendingTabId = $derived(pendingPathname ? getActiveTabId(pendingPathname) : null);
	const isLoading = $derived(
		Boolean(navigating.to) && pendingTabId != null && pendingTabId !== activeTabId
	);

	function tabClass(tab: AppTab): string {
		const isActive = tab.id === activeTabId;
		const isPending = tab.id === pendingTabId;

		return cn(
			'flex min-h-14 w-full touch-manipulation select-none flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition active:scale-95',
			isPending
				? 'bg-accent text-accent-foreground'
				: isActive
					? 'bg-secondary text-foreground active:bg-secondary/80'
					: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground'
		);
	}

	function isPendingTab(tab: AppTab): boolean {
		return tab.id === pendingTabId;
	}
</script>

<div
	class="bg-background mx-auto flex min-h-dvh w-full max-w-(--mobile-shell-max-width) flex-col border-x"
>
	{#if isLoading}
		<div class="bg-primary/15 h-0.5 overflow-hidden">
			<div class="bg-primary mobile-shell-loading-bar h-full w-1/3"></div>
		</div>
	{/if}

	<main class="flex-1 overflow-y-auto px-3 py-4 pb-24 sm:px-4" aria-busy={isLoading || undefined}>
		{#if isLoading}
			<p class="sr-only" role="status">Loading</p>
		{/if}
		{@render children()}
	</main>

	<nav
		aria-label="Primary"
		class="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-(--mobile-shell-max-width) border-x border-t backdrop-blur"
	>
		<ul class="grid grid-cols-4 gap-1 p-2">
			{#each APP_TABS as tab (tab.id)}
				<li>
					{#if tab.disabled}
						<span
							aria-disabled="true"
							class="text-muted-foreground/60 flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
						>
							{#if tab.id === 'intake'}
								<UtensilsCrossed size={18} aria-hidden="true" />
							{:else if tab.id === 'shape'}
								<Shirt size={18} aria-hidden="true" />
							{:else if tab.id === 'activity'}
								<Dumbbell size={18} aria-hidden="true" />
							{:else}
								<Settings size={18} aria-hidden="true" />
							{/if}
							<span>{tab.label}</span>
						</span>
					{:else}
						<a
							href={tab.href}
							aria-current={tab.id === activeTabId ? 'page' : undefined}
							aria-busy={isPendingTab(tab) || undefined}
							class={tabClass(tab)}
						>
							{#if isPendingTab(tab)}
								<Loader2 size={18} class="animate-spin" aria-hidden="true" />
							{:else if tab.id === 'intake'}
								<UtensilsCrossed size={18} aria-hidden="true" />
							{:else if tab.id === 'shape'}
								<Shirt size={18} aria-hidden="true" />
							{:else if tab.id === 'activity'}
								<Dumbbell size={18} aria-hidden="true" />
							{:else}
								<Settings size={18} aria-hidden="true" />
							{/if}
							<span>{tab.label}</span>
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
</div>

<style>
	.mobile-shell-loading-bar {
		animation: mobile-shell-loading 900ms var(--ease-in-out) infinite alternate;
	}

	@keyframes mobile-shell-loading {
		from {
			transform: translateX(0%);
		}

		to {
			transform: translateX(200%);
		}
	}
</style>
