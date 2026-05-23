<script lang="ts">
	import { page } from '$app/state';
	import { Button, Card, LinkButton } from '$lib/components/ui';
	import { ThemeToggle } from '$lib/features/theme-toggle';

	const user = $derived(page.data.user);
</script>

<section class="space-y-4" aria-labelledby="settings-heading">
	<h2 id="settings-heading" class="text-xl font-semibold tracking-tight">Settings</h2>

	<Card class="space-y-3 p-4">
		<p class="text-sm font-medium">General app and profile settings live here.</p>
		<div class="flex items-center justify-between gap-3">
			<p class="text-muted-foreground text-sm">Theme mode</p>
			<ThemeToggle />
		</div>
	</Card>

	<Card class="space-y-3 p-4">
		<p class="text-sm font-medium">Authorization</p>

		{#if user}
			<p class="text-muted-foreground text-sm">
				Signed in as <span class="text-foreground font-medium">{user.email}</span>
			</p>
			<form method="POST" action="/signout">
				<Button type="submit" variant="outline" class="w-full">Sign out</Button>
			</form>
		{:else}
			<p class="text-muted-foreground text-sm">You are currently signed out.</p>
			<div class="grid grid-cols-2 gap-2">
				<LinkButton href="/login" variant="outline" class="w-full">Login</LinkButton>
				<LinkButton href="/signup" variant="outline" class="w-full">Sign up</LinkButton>
			</div>
		{/if}
	</Card>
</section>
