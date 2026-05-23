<script lang="ts">
	import { page } from '$app/state';
	import { Dumbbell, Ruler, Settings, UtensilsCrossed } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { APP_TABS, getActiveTabId } from './mobile-shell.utils';
	import type { AppTab } from './mobile-shell.types';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const activeTabId = $derived(getActiveTabId(page.url.pathname));
	const activeTab = $derived(APP_TABS.find((tab) => tab.id === activeTabId));

	function tabClass(tab: AppTab): string {
		const isActive = tab.id === activeTabId;

		return cn(
			'flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
			isActive
				? 'bg-secondary text-foreground'
				: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
		);
	}
</script>

<div
	class="bg-background mx-auto flex min-h-dvh w-full max-w-(--mobile-shell-max-width) flex-col border-x"
>
	<header class="border-b px-3 py-3 sm:px-4">
		<h1 class="text-base font-semibold tracking-tight">{activeTab?.label ?? 'Intake'}</h1>
	</header>

	<main class="flex-1 overflow-y-auto px-3 py-4 pb-24 sm:px-4">
		{@render children()}
	</main>

	<nav
		aria-label="Primary"
		class="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 border-t backdrop-blur"
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
							{:else if tab.id === 'form'}
								<Ruler size={18} aria-hidden="true" />
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
							class={tabClass(tab)}
						>
							{#if tab.id === 'intake'}
								<UtensilsCrossed size={18} aria-hidden="true" />
							{:else if tab.id === 'form'}
								<Ruler size={18} aria-hidden="true" />
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
