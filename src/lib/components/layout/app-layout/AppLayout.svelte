<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconMoon from '~icons/lucide/moon';
	import IconPanelLeft from '~icons/lucide/panel-left';
	import IconSun from '~icons/lucide/sun';
	import {
		CommandPalette,
		buildNavCommandItems,
		type CommandPaletteItem
	} from '$lib/components/layout/command-palette';
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
		extraCommands?: CommandPaletteItem[];
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
		extraCommands = [],
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

	const commandPaletteItems = $derived.by(() => {
		const navItems = buildNavCommandItems(sections, onNavigate);
		const quickActions: CommandPaletteItem[] = [
			{
				id: 'action:toggle-sidebar',
				title: collapsed ? 'Buka Sidebar' : 'Tutup Sidebar',
				group: 'AKSI CEPAT',
				keywords: ['sidebar', 'menu', 'collapse', 'expand'],
				icon: IconPanelLeft,
				onSelect: () => {
					collapsed = !collapsed;
				}
			}
		];

		if (onToggleTheme) {
			quickActions.push({
				id: 'action:toggle-theme',
				title: isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap',
				group: 'AKSI CEPAT',
				keywords: ['tema', 'theme', 'dark', 'light', 'gelap', 'terang'],
				icon: isDark ? IconSun : IconMoon,
				onSelect: onToggleTheme
			});
		}

		return [...navItems, ...extraCommands, ...quickActions];
	});

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
				{#snippet actions()}
					<CommandPalette items={commandPaletteItems} />
				{/snippet}
			</AppNavbar>

			<div class="flex flex-1 flex-col gap-8 overflow-y-auto p-surface">
				{@render children()}
			</div>
		</div>
	</div>
</div>
