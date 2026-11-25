<script lang="ts">
	import { Dialog } from 'dystopia-linear-lib/components/dialog';
	import { EmptyState } from 'dystopia-linear-lib/components/empty-state';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconArrowDown from '~icons/lucide/arrow-down';
	import IconArrowUp from '~icons/lucide/arrow-up';
	import IconCommand from '~icons/lucide/command';
	import IconCornerDownLeft from '~icons/lucide/corner-down-left';
	import IconSearch from '~icons/lucide/search';
	import type { CommandPaletteItem } from './command-palette.types';
	import {
		filterCommandItems,
		groupCommandItems,
		isCommandPaletteShortcut,
		isMacPlatform
	} from './command-palette.utils';

	export interface CommandPaletteProps {
		items: CommandPaletteItem[];
		open?: boolean;
		placeholder?: string;
		triggerClass?: string;
	}

	let {
		items,
		open = $bindable(false),
		placeholder = 'Cari halaman atau aksi...',
		triggerClass
	}: CommandPaletteProps = $props();

	const baseId = $props.id();
	const listboxId = `${baseId}-listbox`;

	let query = $state('');
	let activeIndex = $state(0);
	let inputRef = $state<HTMLInputElement | null>(null);
	let listRef = $state<HTMLDivElement | null>(null);

	const isMac = isMacPlatform();
	const shortcutHint = isMac ? '⌘K' : 'Ctrl K';

	const filteredItems = $derived(filterCommandItems(items, query));
	const groupedItems = $derived(groupCommandItems(filteredItems));
	const flatItems = $derived(groupedItems.flatMap((group) => group.items));
	const flatIndexById = $derived(new Map(flatItems.map((item, idx) => [item.id, idx])));
	const activeItemId = $derived(
		flatItems[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined
	);

	$effect(() => {
		if (!open) return;

		query = '';
		activeIndex = 0;

		const frame = requestAnimationFrame(() => {
			inputRef?.focus();
		});

		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (!open || !listRef) return;
		const activeEl = listRef.querySelector<HTMLElement>(`[data-command-index="${activeIndex}"]`);
		activeEl?.scrollIntoView({ block: 'nearest' });
	});

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (!isCommandPaletteShortcut(event)) return;
		// Avoid opening over another active modal dialog unless toggling this palette closed.
		if (!open && document.querySelector('[role="dialog"][aria-modal="true"]')) return;

		event.preventDefault();
		open = !open;
	}

	function handleQueryInput(): void {
		activeIndex = 0;
	}

	function executeItem(item: CommandPaletteItem): void {
		open = false;
		item.onSelect?.();
	}

	function handleInputKeydown(event: KeyboardEvent): void {
		if (flatItems.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % flatItems.length;
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = (activeIndex - 1 + flatItems.length) % flatItems.length;
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			activeIndex = 0;
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			activeIndex = flatItems.length - 1;
			return;
		}

		if (event.key === 'Enter') {
			const selected = flatItems[activeIndex];
			if (!selected) return;
			event.preventDefault();
			executeItem(selected);
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<Dialog
	bind:open
	aria-label="Buka Command Palette"
	labels={{ close: 'Tutup Command Palette' }}
	classes={{
		trigger: cn(
			'h-8! gap-cozy! border-border bg-surface-subtle/60 px-2.5! text-xs font-medium text-foreground-subtle hover:bg-surface-hover sm:min-w-52 sm:justify-between!',
			triggerClass
		),
		overlay: 'bg-overlay! backdrop-blur-sm',
		content: 'max-w-xl! overflow-hidden p-0! bg-surface shadow-sm',
		title: 'sr-only',
		body: 'mt-0!'
	}}
>
	{#snippet trigger()}
		<span class="flex items-center gap-tight">
			<IconSearch class="size-3.5 shrink-0 text-foreground-faint" aria-hidden="true" />
			<span class="hidden text-foreground-subtle sm:inline">Cari menu atau aksi...</span>
		</span>
		<kbd
			class="hidden items-center rounded-sm border border-border bg-surface px-1.5 py-0.5 text-xs leading-none font-medium text-foreground-faint sm:inline-flex"
		>
			{shortcutHint}
		</kbd>
	{/snippet}

	{#snippet title()}
		Command Palette
	{/snippet}

	{#snippet close()}{/snippet}

	{#snippet children({ close: closeDialog })}
		<div class="flex flex-col">
			<!-- Search Input Bar -->
			<div class="flex items-center gap-cozy border-b border-border px-3.5 py-2.5">
				<IconSearch class="size-4 shrink-0 text-foreground-faint" aria-hidden="true" />
				<input
					bind:this={inputRef}
					bind:value={query}
					type="text"
					role="combobox"
					aria-expanded={open}
					aria-controls={listboxId}
					aria-activedescendant={activeItemId}
					aria-autocomplete="list"
					aria-label="Cari halaman atau aksi"
					{placeholder}
					oninput={handleQueryInput}
					onkeydown={handleInputKeydown}
					class="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-faint focus:outline-none"
				/>
				<button
					type="button"
					onclick={closeDialog}
					class="inline-flex shrink-0 cursor-pointer items-center rounded-md border border-border bg-surface-subtle px-1.5 py-0.5 text-xs font-medium text-foreground-subtle transition-colors duration-150 hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					Esc
				</button>
			</div>

			<!-- Command List -->
			<div
				bind:this={listRef}
				id={listboxId}
				role="listbox"
				aria-label="Daftar perintah"
				class="max-h-80 overflow-y-auto p-1.5"
			>
				{#if flatItems.length === 0}
					<EmptyState class="py-8">
						{#snippet icon()}
							<IconSearch class="size-5 text-foreground-faint" />
						{/snippet}
						{#snippet title()}
							<Typography variant="h4" as="span">Tidak ada hasil</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span">
								{query.trim()
									? `Tidak ditemukan menu atau aksi untuk "${query.trim()}".`
									: 'Belum ada perintah tersedia.'}
							</Typography>
						{/snippet}
					</EmptyState>
				{:else}
					<div class="flex flex-col gap-cozy">
						{#each groupedItems as section (section.group)}
							<div role="group" aria-label={section.group} class="flex flex-col gap-0.5">
								<Typography
									variant="small"
									as="div"
									class="px-2.5 py-1 text-xs font-medium tracking-wider text-foreground-faint uppercase"
								>
									{section.group}
								</Typography>

								{#each section.items as item (item.id)}
									{@const index = flatIndexById.get(item.id) ?? -1}
									{@const isActive = index === activeIndex}
									{@const ItemIcon = item.icon ?? IconCommand}

									<button
										id={`${baseId}-option-${index}`}
										type="button"
										role="option"
										aria-selected={isActive}
										data-command-index={index}
										onmouseenter={() => {
											if (index >= 0) activeIndex = index;
										}}
										onclick={() => executeItem(item)}
										class={cn(
											'flex w-full cursor-pointer items-center justify-between gap-cozy rounded-md px-2.5 py-2 text-left transition-colors duration-150 focus:outline-none',
											isActive
												? 'bg-surface-hover text-foreground'
												: 'text-foreground-soft hover:bg-surface-subtle'
										)}
									>
										<span class="flex min-w-0 items-center gap-cozy">
											<ItemIcon
												class={cn(
													'size-4 shrink-0',
													isActive ? 'text-primary' : 'text-foreground-faint'
												)}
												aria-hidden="true"
											/>
											<span class="truncate text-sm font-medium">{item.title}</span>
											{#if item.subtitle}
												<Typography
													variant="small"
													as="span"
													class="truncate text-foreground-faint"
												>
													{item.subtitle}
												</Typography>
											{/if}
										</span>

										<span class="flex shrink-0 items-center gap-tight">
											{#if item.shortcut}
												<kbd
													class="rounded-sm border border-border bg-surface-subtle px-1.5 py-0.5 text-xs font-medium text-foreground-subtle"
												>
													{item.shortcut}
												</kbd>
											{:else if isActive}
												<IconCornerDownLeft
													class="size-3.5 text-foreground-faint"
													aria-hidden="true"
												/>
											{/if}
										</span>
									</button>
								{/each}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer Hints -->
			<div
				class="flex items-center justify-between border-t border-border bg-surface-subtle px-3.5 py-2"
			>
				<div class="flex items-center gap-loose">
					<span class="flex items-center gap-tight">
						<span
							class="inline-flex items-center gap-0.5 rounded-sm border border-border bg-surface px-1 py-0.5 text-foreground-subtle"
						>
							<IconArrowUp class="size-3" aria-hidden="true" />
							<IconArrowDown class="size-3" aria-hidden="true" />
						</span>
						<Typography variant="small" as="span" class="text-foreground-faint">
							Navigasi
						</Typography>
					</span>
					<span class="flex items-center gap-tight">
						<span
							class="inline-flex items-center rounded-sm border border-border bg-surface px-1 py-0.5 text-foreground-subtle"
						>
							<IconCornerDownLeft class="size-3" aria-hidden="true" />
						</span>
						<Typography variant="small" as="span" class="text-foreground-faint">Buka</Typography>
					</span>
				</div>

				<Typography variant="small" as="span" class="text-foreground-faint">
					{flatItems.length} perintah
				</Typography>
			</div>
		</div>
	{/snippet}
</Dialog>
