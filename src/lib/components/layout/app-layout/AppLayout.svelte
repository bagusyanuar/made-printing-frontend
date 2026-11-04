<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AppSidebar } from '$lib/components/layout/sidebar';
	import { AppNavbar } from '$lib/components/layout/navbar';
	import type { NavSection } from '$lib/components/ui/sidebar/sidebar.types';

	const RAIL_STORAGE_KEY = 'made-printing-sidebar-rail';

	interface AppLayoutBrand {
		initial?: string;
		name: string;
		subtitle: string;
	}

	interface AppLayoutUser {
		initials: string;
		name: string;
		subtitle: string;
	}

	interface AppLayoutProps {
		sections: NavSection[];
		brand: AppLayoutBrand;
		logo?: Snippet;
		user: AppLayoutUser;
		activeHref: string;
		collapsed?: boolean;
		version?: string;
		title?: Snippet;
		isDark?: boolean;
		onToggleTheme?: () => void;
		onNavigate?: (href: string) => void;
		onLogout?: () => void;
		children: Snippet;
	}

	function readStoredRail(): boolean {
		if (typeof localStorage === 'undefined') return false;
		return localStorage.getItem(RAIL_STORAGE_KEY) === 'true';
	}

	let {
		sections,
		brand,
		logo,
		user,
		activeHref = $bindable(),
		collapsed = $bindable(readStoredRail()),
		version,
		title,
		isDark,
		onToggleTheme,
		onNavigate,
		onLogout,
		children
	}: AppLayoutProps = $props();

	$effect(() => {
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem(RAIL_STORAGE_KEY, String(collapsed));
			} catch {
				// Private browsing mode or storage full
			}
		}
	});
</script>

<div class="flex h-screen bg-canvas">
	<AppSidebar
		bind:collapsed
		bind:activeHref
		{sections}
		{brand}
		{logo}
		{user}
		{version}
		{onNavigate}
		{onLogout}
	/>

	<div class="min-w-0 flex-1 py-compact pr-compact">
		<div
			class="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-xs"
		>
			<AppNavbar bind:collapsed {isDark} {onToggleTheme}>
				{@render title?.()}
			</AppNavbar>

			<div class="flex flex-1 flex-col gap-8 overflow-y-auto p-surface">
				{@render children()}
			</div>
		</div>
	</div>
</div>
