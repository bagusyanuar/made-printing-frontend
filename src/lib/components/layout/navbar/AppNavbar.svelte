<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconPanelLeft from '~icons/lucide/panel-left';
	import IconSun from '~icons/lucide/sun';
	import IconMoon from '~icons/lucide/moon';

	interface AppNavbarProps {
		collapsed?: boolean;
		isDark?: boolean;
		onToggleTheme?: () => void;
		children?: Snippet;
	}

	let { collapsed = $bindable(false), isDark, onToggleTheme, children }: AppNavbarProps = $props();

	const iconButtonClass =
		'text-foreground-subtle hover:text-foreground inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
</script>

<header class="flex h-14 shrink-0 items-center gap-cozy border-b border-border px-compact">
	<button
		type="button"
		aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		aria-expanded={!collapsed}
		onclick={() => (collapsed = !collapsed)}
		class={iconButtonClass}
	>
		<IconPanelLeft class="size-4" />
	</button>

	{#if children}
		{@render children()}
	{/if}

	{#if onToggleTheme}
		<div class="ml-auto flex shrink-0 items-center gap-cozy">
			<button
				type="button"
				aria-label={isDark ? 'Beralih ke tema terang' : 'Beralih ke tema gelap'}
				onclick={onToggleTheme}
				class={iconButtonClass}
			>
				{#if isDark}
					<IconMoon class="size-4" />
				{:else}
					<IconSun class="size-4" />
				{/if}
			</button>
		</div>
	{/if}
</header>
