<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarItem,
		SidebarCollapsibleItem
	} from 'dystopia-linear-lib/components/sidebar';
	import { Popover } from 'dystopia-linear-lib/components/popover';
	import { Tooltip } from 'dystopia-linear-lib/components/tooltip';
	import { HoverCard } from 'dystopia-linear-lib/components/hover-card';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconChevronsUpDown from '~icons/lucide/chevrons-up-down';
	import IconLogOut from '~icons/lucide/log-out';

	import {
		isNavGroup,
		type NavGroup,
		type NavSection
	} from '$lib/components/ui/sidebar/sidebar.types';
	import { isActiveHref, sectionContainsActive } from '$lib/components/ui/sidebar/sidebar.nav';

	interface AppSidebarBrand {
		initial?: string;
		name: string;
		subtitle: string;
	}

	interface AppSidebarUser {
		initials: string;
		name: string;
		subtitle: string;
	}

	interface AppSidebarProps {
		sections: NavSection[];
		brand: AppSidebarBrand;
		logo?: Snippet;
		user: AppSidebarUser;
		activeHref: string;
		collapsed?: boolean;
		version?: string;
		onNavigate?: (href: string) => void;
		onLogout?: () => void;
	}

	let {
		sections,
		brand,
		logo,
		user,
		activeHref = $bindable(),
		collapsed = $bindable(false),
		version,
		onNavigate,
		onLogout
	}: AppSidebarProps = $props();

	function navigate(href: string): void {
		activeHref = href;
		onNavigate?.(href);
	}

	function handleLinkClick(event: MouseEvent, href: string): void {
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		navigate(href);
	}

	let openGroups = $state<Record<string, boolean>>(
		untrack(() => {
			const active = sectionContainsActive(sections, activeHref);
			const groupIds = sections.flatMap((section) =>
				section.entries.filter(isNavGroup).map((entry: NavGroup) => entry.id)
			);
			return Object.fromEntries(groupIds.map((id) => [id, active.has(id)]));
		})
	);
</script>

{#snippet linkContent(isActive: boolean, title: string, icon?: Snippet, badge?: string | number)}
	{#if isActive}
		<span aria-hidden="true" class="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"></span>
	{/if}
	{#if icon}
		<span
			class={cn('shrink-0', isActive ? 'text-primary' : 'text-foreground-faint')}
			aria-hidden="true"
		>
			{@render icon()}
		</span>
	{/if}
	<span class={cn('truncate', collapsed && 'sr-only')}>{title}</span>
	{#if badge && !collapsed}
		<span
			class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
		>
			{badge}
		</span>
	{/if}
{/snippet}

<Sidebar bind:collapsed class="border-r-0 bg-transparent pt-compact pb-compact">
	<SidebarHeader class={collapsed ? 'h-14 justify-center border-b-0' : 'h-14 border-b-0'}>
		{#if logo}
			{@render logo()}
		{:else}
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
			>
				{brand.initial ?? 'M'}
			</div>
		{/if}
		<div class="flex min-w-0 flex-col leading-tight" class:hidden={collapsed}>
			<span class="truncate text-sm font-bold text-primary">{brand.name}</span>
			<span class="truncate text-xs text-foreground-subtle">{brand.subtitle}</span>
		</div>
	</SidebarHeader>

	<SidebarContent>
		{#each sections as section (section.label)}
			<SidebarGroup>
				{#if section.label}
					<SidebarGroupLabel class="mt-2 mb-1 text-[11px] tracking-widest uppercase">
						{section.label}
					</SidebarGroupLabel>
				{/if}
				{#each section.entries as entry (isNavGroup(entry) ? entry.id : entry.href)}
					{#if isNavGroup(entry)}
						{@const GroupIcon = entry.icon}
						{#snippet groupTrigger()}
							<SidebarCollapsibleItem bind:open={openGroups[entry.id]}>
								{#snippet icon()}
									<GroupIcon class="size-4" />
								{/snippet}
								{#snippet trigger()}
									{entry.title}
								{/snippet}
								{#each entry.children as groupChild (groupChild.href)}
									<SidebarItem
										size="sm"
										class="text-xs"
										active={isActiveHref(activeHref, groupChild.href)}
									>
										{#snippet child({ props })}
											<a
												{...props}
												href={groupChild.href}
												onclick={(e) => handleLinkClick(e, groupChild.href)}
											>
												{@render linkContent(
													isActiveHref(activeHref, groupChild.href),
													groupChild.title,
													undefined,
													groupChild.badge
												)}
											</a>
										{/snippet}
										{groupChild.title}
									</SidebarItem>
								{/each}
							</SidebarCollapsibleItem>
						{/snippet}

						{#if collapsed}
							<HoverCard
								placement="right-start"
								offset={8}
								openDelay={150}
								closeDelay={150}
								classes={{ content: 'w-52 p-1 border border-border bg-app-surface shadow-md' }}
							>
								{@render groupTrigger()}
								{#snippet content()}
									<p
										class="px-compact pt-tight pb-0.5 text-xs font-semibold text-foreground-subtle"
									>
										{entry.title}
									</p>
									<div class="flex flex-col gap-0.5">
										{#each entry.children as groupChild (groupChild.href)}
											<a
												href={groupChild.href}
												onclick={(e) => handleLinkClick(e, groupChild.href)}
												class={cn(
													'flex w-full cursor-pointer items-center justify-between gap-tight rounded-md px-compact py-control-y text-sm transition-colors duration-150 hover:bg-surface-hover',
													isActiveHref(activeHref, groupChild.href)
														? 'font-medium text-primary'
														: 'text-foreground-soft'
												)}
											>
												<span>{groupChild.title}</span>
												{#if groupChild.badge}
													<span
														class="py-0.2 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary"
													>
														{groupChild.badge}
													</span>
												{/if}
											</a>
										{/each}
									</div>
								{/snippet}
							</HoverCard>
						{:else}
							{@render groupTrigger()}
						{/if}
					{:else}
						{@const EntryIcon = entry.icon}
						{#snippet entryIcon()}
							<EntryIcon class="size-4" />
						{/snippet}
						{#snippet leafItem()}
							<SidebarItem active={isActiveHref(activeHref, entry.href)}>
								{#snippet child({ props })}
									<a {...props} href={entry.href} onclick={(e) => handleLinkClick(e, entry.href)}>
										{@render linkContent(
											isActiveHref(activeHref, entry.href),
											entry.title,
											entryIcon,
											entry.badge
										)}
									</a>
								{/snippet}
								{entry.title}
							</SidebarItem>
						{/snippet}

						{#if collapsed}
							<Tooltip
								placement="right"
								offset={8}
								delayDuration={150}
								showArrow
								classes={{
									content: 'border border-border bg-app-surface text-foreground shadow-sm',
									arrow: 'bg-app-surface'
								}}
							>
								{#snippet content()}
									{entry.title}
								{/snippet}
								{@render leafItem()}
							</Tooltip>
						{:else}
							{@render leafItem()}
						{/if}
					{/if}
				{/each}
			</SidebarGroup>
		{/each}
	</SidebarContent>

	<SidebarFooter class="border-t-0">
		<Popover
			placement="right-end"
			offset={8}
			classes={{
				trigger: collapsed
					? 'flex h-auto w-full items-center justify-center rounded-md border-0 p-tight'
					: 'gap-tight px-compact py-control-y flex h-auto w-full items-center justify-start rounded-md border-0',
				content: 'w-56 p-0 border border-border bg-app-surface shadow-md'
			}}
		>
			{#snippet trigger()}
				<span class="relative shrink-0">
					<span
						class="flex size-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground"
					>
						{user.initials}
					</span>
					<span
						aria-hidden="true"
						class="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-app-surface bg-emerald-500"
					></span>
				</span>
				<span class="flex min-w-0 flex-1 flex-col text-left leading-tight" class:hidden={collapsed}>
					<span class="truncate text-sm font-medium text-foreground">{user.name}</span>
					<span class="truncate text-xs font-light text-foreground-subtle">{user.subtitle}</span>
				</span>
				<IconChevronsUpDown
					class={cn('size-4 shrink-0 text-foreground-faint', collapsed && 'hidden')}
				/>
			{/snippet}

			<div class="flex flex-col gap-0.5 p-compact">
				<span class="text-sm font-medium text-foreground">{user.name}</span>
				<span class="text-xs font-light text-foreground-subtle">{user.subtitle}</span>
			</div>
			<div class="border-t border-border p-tight">
				<button
					type="button"
					onclick={() => onLogout?.()}
					class="flex w-full cursor-pointer items-center gap-tight rounded-md px-compact py-control-y text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:text-red-400"
				>
					<IconLogOut class="size-4" />
					Keluar Sistem
				</button>
			</div>
		</Popover>

		{#if version}
			<div class="-mx-compact border-t border-border pt-tight">
				<div
					class="flex flex-col items-center text-center text-[11px] leading-tight text-foreground-faint"
					class:hidden={collapsed}
				>
					<span>Made Printing &copy; {new Date().getFullYear()}</span>
					<span>Digital Printing ERP v{version}</span>
				</div>
			</div>
		{/if}
	</SidebarFooter>
</Sidebar>
