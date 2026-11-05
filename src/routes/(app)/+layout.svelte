<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { AppLayout } from '$lib/components/layout/app-layout';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { themeStore } from '$lib/shared/presentation/theme.store.svelte';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { appNavSections } from './app.nav';

	let { children } = $props();

	let collapsed = $state(false);

	const brand = {
		initial: 'MP',
		name: 'Made Printing',
		subtitle: 'Digital Printing ERP'
	};

	const currentUser = {
		initials: 'AD',
		name: 'Admin Percetakan',
		subtitle: 'admin@madeprinting.com'
	};
</script>

<AppLayout
	bind:collapsed
	activeHref={page.url.pathname}
	sections={appNavSections}
	{brand}
	version="1.0.0"
	user={currentUser}
	isDark={themeStore.isDark}
	onToggleTheme={() => themeStore.toggle()}
	onNavigate={(href) => goto(href)}
	onLogout={() => console.log('Logout clicked')}
>
	{#snippet title()}
		{#if pageTitleStore.title}
			<Typography variant="h4" as="h1" class="text-sm font-semibold text-foreground">
				{pageTitleStore.title}
			</Typography>
		{/if}
	{/snippet}

	{@render children()}
</AppLayout>
