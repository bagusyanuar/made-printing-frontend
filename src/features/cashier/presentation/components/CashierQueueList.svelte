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

	function handleTabChange(tab: 'PRODUCTION' | 'RETAIL') {
		cashierStore.setTab(tab);
	}
</script>

<div class="flex flex-col gap-3">
	<!-- Discrete Tabs (No Wrapper Container, Produksi = Merah, Ritel = Orange) -->
	<div
		role="tablist"
		aria-label="Pilihan Antrean Transaksi Kasir"
		class="grid grid-cols-2 gap-2.5 select-none"
	>
		<!-- Tab 1: Tiket Produksi (Merah) -->
		<button
			type="button"
			role="tab"
			aria-selected={cashierStore.activeTab === 'PRODUCTION'}
			onclick={() => handleTabChange('PRODUCTION')}
			class="group relative flex items-center justify-center gap-2 rounded-lg border py-2.5 px-3 transition-all duration-150 cursor-pointer active:scale-[0.98] {cashierStore.activeTab ===
			'PRODUCTION'
				? 'border-red-600 bg-red-600 text-white font-bold shadow-xs dark:border-red-600 dark:bg-red-600'
				: 'border-border bg-card text-foreground-subtle hover:border-red-500/40 hover:bg-red-500/5 hover:text-foreground'}"
		>
			<IconLayers
				class="size-4 shrink-0 transition-transform duration-150 {cashierStore.activeTab ===
				'PRODUCTION'
					? 'text-white'
					: 'text-red-500 group-hover:scale-105'}"
			/>
			<span class="text-xs">Tiket Produksi</span>
			{#if cashierStore.productionQueueCount > 0}
				<span
					class="flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-all duration-150 {cashierStore.activeTab ===
					'PRODUCTION'
						? 'bg-white text-red-600'
						: 'border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'}"
				>
					{cashierStore.productionQueueCount}
				</span>
			{/if}
		</button>

		<!-- Tab 2: Pesanan Ritel (Orange) -->
		<button
			type="button"
			role="tab"
			aria-selected={cashierStore.activeTab === 'RETAIL'}
			onclick={() => handleTabChange('RETAIL')}
			class="group relative flex items-center justify-center gap-2 rounded-lg border py-2.5 px-3 transition-all duration-150 cursor-pointer active:scale-[0.98] {cashierStore.activeTab ===
			'RETAIL'
				? 'border-orange-500 bg-orange-500 text-white font-bold shadow-xs dark:border-orange-500 dark:bg-orange-500'
				: 'border-border bg-card text-foreground-subtle hover:border-orange-500/40 hover:bg-orange-500/5 hover:text-foreground'}"
		>
			<IconShoppingBag
				class="size-4 shrink-0 transition-transform duration-150 {cashierStore.activeTab ===
				'RETAIL'
					? 'text-white'
					: 'text-orange-500 group-hover:scale-105'}"
			/>
			<span class="text-xs">Pesanan Ritel</span>
			{#if cashierStore.retailQueueCount > 0}
				<span
					class="flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-all duration-150 {cashierStore.activeTab ===
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
