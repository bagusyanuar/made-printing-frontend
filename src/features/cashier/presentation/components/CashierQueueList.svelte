<script lang="ts">
	import { cashierStore } from '../../application/cashier.store.svelte';
	import CashierQueueCard from './CashierQueueCard.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import IconLayers from '~icons/lucide/layers';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconSearch from '~icons/lucide/search';
	import IconPlus from '~icons/lucide/plus';
	import IconInbox from '~icons/lucide/inbox';

	interface Props {
		onCreateRetailOrder: () => void;
	}

	let { onCreateRetailOrder }: Props = $props();

	let prodTabEl = $state<HTMLButtonElement | null>(null);
	let retailTabEl = $state<HTMLButtonElement | null>(null);
	let indicatorStyle = $state('opacity: 0;');
	let isMounted = $state(false);

	function updateIndicator() {
		const el = cashierStore.activeTab === 'PRODUCTION' ? prodTabEl : retailTabEl;
		if (el) {
			indicatorStyle = `transform: translate3d(${el.offsetLeft}px, ${el.offsetTop}px, 0); width: ${el.offsetWidth}px; height: ${el.offsetHeight}px; opacity: 1;`;
		}
	}

	$effect(() => {
		void cashierStore.activeTab;
		void cashierStore.productionQueueCount;
		void cashierStore.retailQueueCount;
		if (prodTabEl && retailTabEl) {
			updateIndicator();
			if (!isMounted) {
				requestAnimationFrame(() => {
					isMounted = true;
				});
			}
		}
	});

	function handleTabChange(tab: 'PRODUCTION' | 'RETAIL') {
		cashierStore.setTab(tab);
	}
</script>

<div class="flex flex-col gap-3">
	<!-- Discrete Compact Tabs (No Wrapper, Animated Sliding Pill) -->
	<div
		role="tablist"
		aria-label="Pilihan Antrean Transaksi Kasir"
		class="relative flex items-center gap-2 select-none"
	>
		<!-- Sliding Pill Indicator -->
		<div
			class="pointer-events-none absolute top-0 left-0 rounded-md {isMounted
				? 'transition-all duration-250 ease-out'
				: ''} {cashierStore.activeTab === 'PRODUCTION'
				? 'bg-red-600 shadow-xs dark:bg-red-600'
				: 'bg-orange-500 shadow-xs dark:bg-orange-500'}"
			style={indicatorStyle}
		></div>

		<!-- Tab 1: Tiket Produksi -->
		<button
			bind:this={prodTabEl}
			type="button"
			role="tab"
			aria-selected={cashierStore.activeTab === 'PRODUCTION'}
			onclick={() => handleTabChange('PRODUCTION')}
			class="group relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-all duration-150 active:scale-95 {cashierStore.activeTab ===
			'PRODUCTION'
				? 'border-transparent font-bold text-white'
				: 'border-border bg-app-surface font-medium text-foreground-subtle hover:border-red-500/40 hover:bg-red-500/5 hover:text-foreground'}"
		>
			<IconLayers
				class="size-3.5 shrink-0 transition-transform duration-150 {cashierStore.activeTab ===
				'PRODUCTION'
					? 'text-white'
					: 'text-red-500 group-hover:scale-105'}"
			/>
			<span>Tiket Produksi</span>
			{#if cashierStore.productionQueueCount > 0}
				<span
					class="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-all duration-150 {cashierStore.activeTab ===
					'PRODUCTION'
						? 'bg-white text-red-600'
						: 'border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'}"
				>
					{cashierStore.productionQueueCount}
				</span>
			{/if}
		</button>

		<!-- Tab 2: Pesanan Ritel -->
		<button
			bind:this={retailTabEl}
			type="button"
			role="tab"
			aria-selected={cashierStore.activeTab === 'RETAIL'}
			onclick={() => handleTabChange('RETAIL')}
			class="group relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-all duration-150 active:scale-95 {cashierStore.activeTab ===
			'RETAIL'
				? 'border-transparent font-bold text-white'
				: 'border-border bg-app-surface font-medium text-foreground-subtle hover:border-orange-500/40 hover:bg-orange-500/5 hover:text-foreground'}"
		>
			<IconShoppingBag
				class="size-3.5 shrink-0 transition-transform duration-150 {cashierStore.activeTab ===
				'RETAIL'
					? 'text-white'
					: 'text-orange-500 group-hover:scale-105'}"
			/>
			<span>Pesanan Ritel</span>
			{#if cashierStore.retailQueueCount > 0}
				<span
					class="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-all duration-150 {cashierStore.activeTab ===
					'RETAIL'
						? 'bg-white text-orange-600'
						: 'border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400'}"
				>
					{cashierStore.retailQueueCount}
				</span>
			{/if}
		</button>
	</div>

	<!-- Search & Toolbar (Standard Medium Size) -->
	<div class="flex items-center gap-2">
		<div class="flex-1">
			<TextField
				size="md"
				placeholder="Cari nomor tiket, pelanggan, desainer..."
				value={cashierStore.searchQuery}
				onValueChange={(val) => cashierStore.setSearch(val)}
				class="w-full"
			>
				{#snippet prefix()}
					<IconSearch class="size-4 text-foreground-subtle" />
				{/snippet}
			</TextField>
		</div>

		{#if cashierStore.activeTab === 'RETAIL'}
			<Button
				variant="default"
				size="md"
				onclick={onCreateRetailOrder}
				class="h-10 shrink-0 gap-1.5 rounded-md px-3 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white"
			>
				<IconPlus class="size-4" />
				<span>Nota Baru</span>
			</Button>
		{/if}
	</div>

	<!-- Queue List -->
	<div class="flex flex-col gap-2">
		{#if cashierStore.filteredQueue.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12 text-center"
			>
				<div
					class="flex size-10 items-center justify-center rounded-full bg-muted text-foreground-subtle"
				>
					<IconInbox class="size-5" />
				</div>
				<Typography variant="body" as="p" class="mt-3 text-xs font-semibold text-foreground">
					Tidak Ada Antrean {cashierStore.activeTab === 'PRODUCTION' ? 'Produksi' : 'Ritel'}
				</Typography>
				<Typography variant="muted" as="p" class="mt-0.5 text-[11px] text-foreground-subtle">
					{cashierStore.searchQuery
						? 'Tidak ada tiket yang cocok dengan kata kunci.'
						: 'Semua tiket pada antrean ini sudah diproses.'}
				</Typography>
				{#if cashierStore.activeTab === 'RETAIL'}
					<Button
						variant="outline"
						size="sm"
						onclick={onCreateRetailOrder}
						class="mt-3 h-8 gap-1 rounded-md text-xs font-bold"
					>
						<IconPlus class="size-3.5" />
						<span>Buat Nota Ritel Baru</span>
					</Button>
				{/if}
			</div>
		{:else}
			{#each cashierStore.filteredQueue as order (order.id)}
				<CashierQueueCard
					{order}
					isSelected={cashierStore.selectedOrderId === order.id}
					onSelect={(id) => cashierStore.selectOrder(id)}
				/>
			{/each}
		{/if}
	</div>
</div>
