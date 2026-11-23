<script lang="ts">
	import { onMount } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Card, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { EmptyState } from 'dystopia-linear-lib/components/empty-state';
	import { Spinner } from 'dystopia-linear-lib/components/spinner';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell
	} from 'dystopia-linear-lib/components/table';
	import { toast } from 'dystopia-linear-lib/components/toast';

	import IconReceipt from '~icons/lucide/receipt';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import IconSearch from '~icons/lucide/search';
	import IconRefreshCw from '~icons/lucide/refresh-cw';
	import IconDownload from '~icons/lucide/download';
	import IconEye from '~icons/lucide/eye';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconPrinter from '~icons/lucide/printer';
	import IconLayers from '~icons/lucide/layers';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconPackage from '~icons/lucide/package';
	import IconX from '~icons/lucide/x';

	import type { Order, OrderPaymentStatus, OrderType } from '../../domain/order.entity';
	import { formatCurrency, formatOrderDateTime } from '../../domain/order.entity';
	import { orderStore } from '../../application/order.store.svelte';

	import OrderDetailDialog from '../components/OrderDetailDialog.svelte';
	import OrderPaymentDialog from '../components/OrderPaymentDialog.svelte';
	import OrderReceiptDialog from '../components/OrderReceiptDialog.svelte';

	// Dialog states
	let isDetailOpen = $state(false);
	let selectedOrderForDetail = $state<Order | null>(null);

	let isPaymentOpen = $state(false);
	let selectedOrderForPayment = $state<Order | null>(null);

	let isReceiptOpen = $state(false);
	let selectedOrderForReceipt = $state<Order | null>(null);

	// Tab animation state
	type TabKey = 'ALL' | 'UNSETTLED' | 'OVERDUE' | 'LUNAS';
	let tabRefs = $state<Record<TabKey, HTMLButtonElement | null>>({
		ALL: null,
		UNSETTLED: null,
		OVERDUE: null,
		LUNAS: null
	});
	let indicatorStyle = $state('opacity: 0;');
	let isTabMounted = $state(false);

	onMount(() => {
		orderStore.load();
	});

	function updateIndicator() {
		const currentKey = (orderStore.statusFilter as TabKey) || 'ALL';
		const el = tabRefs[currentKey];
		if (el) {
			indicatorStyle = `transform: translate3d(${el.offsetLeft}px, ${el.offsetTop}px, 0); width: ${el.offsetWidth}px; height: ${el.offsetHeight}px; opacity: 1;`;
		}
	}

	$effect(() => {
		void orderStore.statusFilter;
		void orderStore.unsettledCount;
		void orderStore.overdueCount;
		void orderStore.paidCount;
		if (tabRefs.ALL && tabRefs.UNSETTLED && tabRefs.OVERDUE && tabRefs.LUNAS) {
			updateIndicator();
			if (!isTabMounted) {
				requestAnimationFrame(() => {
					isTabMounted = true;
				});
			}
		}
	});

	function handleTabChange(tab: TabKey) {
		orderStore.setStatusFilter(tab);
	}

	function handleOrderTypeChange(type: OrderType | 'ALL') {
		orderStore.setOrderTypeFilter(type);
	}

	function openDetail(ord: Order) {
		selectedOrderForDetail = ord;
		isDetailOpen = true;
	}

	function openPayment(ord: Order) {
		selectedOrderForPayment = ord;
		isPaymentOpen = true;
	}

	function openReceipt(ord: Order) {
		selectedOrderForReceipt = ord;
		isReceiptOpen = true;
	}

	function getStatusBadgeProps(status: OrderPaymentStatus) {
		switch (status) {
			case 'LUNAS':
				return { label: 'Lunas', variant: 'success' as const };
			case 'PARTIAL_PAID':
				return { label: 'DP / Sebagian', variant: 'warning' as const };
			case 'UNPAID':
				return { label: 'Tempo', variant: 'info' as const };
			case 'OVERDUE':
				return { label: 'Jatuh Tempo', variant: 'danger' as const };
			case 'CANCELLED':
				return { label: 'Dibatalkan', variant: 'secondary' as const };
			default:
				return { label: status, variant: 'secondary' as const };
		}
	}

	function exportCsv() {
		const list = orderStore.filteredOrders;
		if (list.length === 0) {
			toast.info('Tidak ada data pesanan untuk diekspor');
			return;
		}

		const headers = [
			'No. Invoice',
			'No. SPK',
			'Tipe Order',
			'Pelanggan',
			'Reseller',
			'Telepon',
			'Status Pengerjaan',
			'Lokasi Rak',
			'Tanggal Diterbitkan',
			'Jatuh Tempo',
			'Total Tagihan (Rp)',
			'Terbayar (Rp)',
			'Sisa Tagihan (Rp)',
			'Status Pembayaran'
		];

		const rows = list.map((ord) => [
			`"${ord.invoiceNumber}"`,
			`"${ord.jobNumber}"`,
			`"${ord.orderType === 'PRODUCTION' ? 'Produksi Cetak' : 'Ritel Walk-in'}"`,
			`"${ord.customerName}"`,
			`"${ord.resellerName || '-'}"`,
			`"${ord.customerPhone}"`,
			`"${ord.fulfillmentStatus}"`,
			`"${ord.rackLocation || '-'}"`,
			`"${formatOrderDateTime(ord.issuedAt)}"`,
			`"${ord.dueDate ? formatOrderDateTime(ord.dueDate) : 'Lunas Saat Ambil'}"`,
			ord.subtotal,
			ord.totalPaid,
			ord.remainingAmount,
			`"${ord.status}"`
		]);

		const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute(
			'download',
			`rekap-pesanan-${new Date().toISOString().slice(0, 10)}.csv`
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success('Rekap pesanan berhasil diekspor', {
			description: `${list.length} baris data pesanan telah diunduh sebagai file CSV.`
		});
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-start gap-3.5 sm:gap-4">
			<div
				class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
			>
				<IconReceipt class="size-6" />
			</div>
			<div class="flex flex-col">
				<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
					Pesanan
				</Typography>
				<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
					Monitoring pengerjaan pesanan aktif, paket siap diambil di rak kasir, dan serah terima pelanggan.
				</Typography>
			</div>
		</div>

		<!-- Header Action Buttons -->
		<div class="flex items-center gap-2 self-start sm:self-auto">
			<Button
				variant="outline"
				size="sm"
				onclick={() => orderStore.refresh()}
				disabled={orderStore.isLoading}
				aria-label="Segarkan data"
				title="Segarkan data"
				class="size-8 justify-center! p-0!"
			>
				<IconRefreshCw
					class="size-4 text-foreground-subtle transition-transform {orderStore.isLoading
						? 'animate-spin'
						: ''}"
				/>
			</Button>

			<Button
				variant="outline"
				size="sm"
				onclick={exportCsv}
				class="h-8 gap-1.5 rounded-md text-xs font-semibold"
			>
				<IconDownload class="size-3.5" />
				<span>Export Rekap CSV</span>
			</Button>
		</div>
	</div>

	<!-- KPI Order Process Monitoring Widgets (4 Aesthetic SaaS Cards) -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Card 1: Total Pesanan Aktif -->
		<Card
			class="bg-app-surface group relative overflow-hidden rounded-xl border border-border/80 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Total Pesanan Aktif
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span class="text-2xl font-bold tracking-tight text-foreground">
								{orderStore.activeCount}
							</span>
							<span class="text-xs font-semibold text-foreground-subtle">
								Pesanan
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 transition-transform duration-200 group-hover:scale-105 dark:text-blue-400"
					>
						<IconLayers class="size-4.5" />
					</div>
				</div>
				<div class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-blue-500"></span>
						<strong class="font-semibold text-foreground">{orderStore.prodActiveCount}</strong> Produksi
					</span>
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-orange-500"></span>
						<strong class="font-semibold text-foreground">{orderStore.retailActiveCount}</strong> Ritel
					</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 2: Sedang Diproses Workshop -->
		<Card
			class="bg-app-surface group relative overflow-hidden rounded-xl border border-border/80 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Sedang Diproses
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span class="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
								{orderStore.processingCount}
							</span>
							<span class="text-xs font-semibold text-foreground-subtle">
								Pesanan
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 transition-transform duration-200 group-hover:scale-105 dark:text-indigo-400"
					>
						<IconPrinter class="size-4.5" />
					</div>
				</div>
				<div class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-indigo-500"></span>
						Antrean Mesin & Finishing
					</span>
					<span class="rounded bg-indigo-500/10 px-1.5 py-0.2 font-bold text-indigo-600 dark:text-indigo-400">
						Workshop
					</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 3: Siap Diambil di Rak -->
		<Card
			class="bg-app-surface group relative overflow-hidden rounded-xl border border-border/80 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Siap Diambil di Rak
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span class="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
								{orderStore.readyCount}
							</span>
							<span class="text-xs font-semibold text-foreground-subtle">
								Paket
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 transition-transform duration-200 group-hover:scale-105 dark:text-amber-400"
					>
						<IconPackage class="size-4.5" />
					</div>
				</div>
				<div class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-amber-500"></span>
						Di Rak Kasir / Meja Depan
					</span>
					{#if orderStore.readyUnpaidCount > 0}
						<span class="rounded bg-amber-500/15 px-1.5 py-0.2 font-bold text-amber-700 dark:text-amber-300">
							{orderStore.readyUnpaidCount} Perlu Pelunasan
						</span>
					{:else}
						<span class="rounded bg-emerald-500/10 px-1.5 py-0.2 font-semibold text-emerald-600 dark:text-emerald-400">
							Lunas Penuh
						</span>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Card 4: Selesai Diambil -->
		<Card
			class="bg-app-surface group relative overflow-hidden rounded-xl border border-border/80 shadow-2xs transition-all duration-200 hover:border-border hover:shadow-xs"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Selesai Diambil
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span class="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
								{orderStore.pickedUpCount}
							</span>
							<span class="text-xs font-semibold text-foreground-subtle">
								Pesanan
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition-transform duration-200 group-hover:scale-105 dark:text-emerald-400"
					>
						<IconCheckCircle2 class="size-4.5" />
					</div>
				</div>
				<div class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-emerald-500"></span>
						Serah Terima Sukses
					</span>
					<span class="font-bold text-emerald-600 dark:text-emerald-400">
						Tuntas
					</span>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Filter Controls & Toolbar -->
	<div class="flex flex-col gap-3">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<!-- Discrete Animated Segmented Tabs -->
			<div
				role="tablist"
				aria-label="Filter status pesanan"
				class="relative flex items-center gap-1.5 overflow-x-auto pb-1 select-none sm:pb-0"
			>
				<!-- Sliding Pill Indicator -->
				<div
					class="pointer-events-none absolute top-0 left-0 rounded-md bg-primary shadow-xs {isTabMounted
						? 'transition-all duration-250 ease-out'
						: ''}"
					style={indicatorStyle}
				></div>

				<!-- Tab 1: Semua Nota -->
				<button
					bind:this={tabRefs.ALL}
					type="button"
					role="tab"
					aria-selected={orderStore.statusFilter === 'ALL'}
					onclick={() => handleTabChange('ALL')}
					class="group relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-all duration-150 active:scale-95 {orderStore.statusFilter ===
					'ALL'
						? 'border-transparent font-bold text-white'
						: 'border-border bg-app-surface font-medium text-foreground-subtle hover:border-primary/40 hover:bg-primary/5 hover:text-foreground'}"
				>
					<span>Semua Nota</span>
					<span
						class="inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-all duration-150 {orderStore.statusFilter ===
						'ALL'
							? 'bg-white text-primary'
							: 'bg-muted text-foreground-subtle'}"
					>
						{orderStore.orders.length}
					</span>
				</button>

				<!-- Tab 2: Menunggu Pelunasan -->
				<button
					bind:this={tabRefs.UNSETTLED}
					type="button"
					role="tab"
					aria-selected={orderStore.statusFilter === 'UNSETTLED'}
					onclick={() => handleTabChange('UNSETTLED')}
					class="group relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-all duration-150 active:scale-95 {orderStore.statusFilter ===
					'UNSETTLED'
						? 'border-transparent font-bold text-white'
						: 'border-border bg-app-surface font-medium text-foreground-subtle hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-foreground'}"
				>
					<span>Menunggu Pelunasan</span>
					{#if orderStore.unsettledCount > 0}
						<span
							class="inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-all duration-150 {orderStore.statusFilter ===
							'UNSETTLED'
								? 'bg-white text-amber-700'
								: 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}"
						>
							{orderStore.unsettledCount}
						</span>
					{/if}
				</button>

				<!-- Tab 3: Jatuh Tempo -->
				<button
					bind:this={tabRefs.OVERDUE}
					type="button"
					role="tab"
					aria-selected={orderStore.statusFilter === 'OVERDUE'}
					onclick={() => handleTabChange('OVERDUE')}
					class="group relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-all duration-150 active:scale-95 {orderStore.statusFilter ===
					'OVERDUE'
						? 'border-transparent font-bold text-white'
						: 'border-border bg-app-surface font-medium text-foreground-subtle hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-foreground'}"
				>
					<span>Jatuh Tempo</span>
					{#if orderStore.overdueCount > 0}
						<span
							class="inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-all duration-150 {orderStore.statusFilter ===
							'OVERDUE'
								? 'bg-white text-rose-700'
								: 'bg-rose-500/15 text-rose-700 dark:text-rose-300'}"
						>
							{orderStore.overdueCount}
						</span>
					{/if}
				</button>

				<!-- Tab 4: Lunas -->
				<button
					bind:this={tabRefs.LUNAS}
					type="button"
					role="tab"
					aria-selected={orderStore.statusFilter === 'LUNAS'}
					onclick={() => handleTabChange('LUNAS')}
					class="group relative z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-all duration-150 active:scale-95 {orderStore.statusFilter ===
					'LUNAS'
						? 'border-transparent font-bold text-white'
						: 'border-border bg-app-surface font-medium text-foreground-subtle hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-foreground'}"
				>
					<span>Lunas</span>
					<span
						class="inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-all duration-150 {orderStore.statusFilter ===
						'LUNAS'
							? 'bg-white text-emerald-700'
							: 'bg-muted text-foreground-subtle'}"
					>
						{orderStore.paidCount}
					</span>
				</button>
			</div>

			<!-- Search & Order Type Filters -->
			<div class="flex flex-wrap items-center gap-2">
				<!-- Order Type Segment -->
				<div class="flex items-center rounded-md border border-border bg-app-surface p-0.5">
					<button
						type="button"
						onclick={() => handleOrderTypeChange('ALL')}
						class="rounded px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.orderTypeFilter ===
						'ALL'
							? 'bg-primary text-primary-foreground'
							: 'text-foreground-subtle hover:text-foreground'}"
					>
						Semua
					</button>
					<button
						type="button"
						onclick={() => handleOrderTypeChange('PRODUCTION')}
						class="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.orderTypeFilter ===
						'PRODUCTION'
							? 'bg-primary text-primary-foreground'
							: 'text-foreground-subtle hover:text-foreground'}"
					>
						<IconLayers class="size-3" />
						<span>Produksi</span>
					</button>
					<button
						type="button"
						onclick={() => handleOrderTypeChange('RETAIL')}
						class="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.orderTypeFilter ===
						'RETAIL'
							? 'bg-primary text-primary-foreground'
							: 'text-foreground-subtle hover:text-foreground'}"
					>
						<IconShoppingBag class="size-3" />
						<span>Ritel</span>
					</button>
				</div>

				<!-- Search Input -->
				<div class="relative w-full sm:w-64">
					<TextField
						size="sm"
						placeholder="Cari invoice, SPK, pelanggan..."
						value={orderStore.searchQuery}
						onValueChange={(val) => orderStore.setSearch(val)}
						class="w-full pl-8"
					/>
					<div
						class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground-subtle"
					>
						<IconSearch class="size-3.5" />
					</div>
					{#if orderStore.searchQuery.trim()}
						<button
							type="button"
							onclick={() => orderStore.setSearch('')}
							class="hover:bg-muted absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-0.5 text-foreground-subtle"
							aria-label="Bersihkan pencarian"
						>
							<IconX class="size-3" />
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Table Card Container -->
		<Card class="bg-app-surface overflow-hidden border border-border shadow-none">
			{#if orderStore.isLoading && orderStore.orders.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Spinner class="size-8 text-primary" />
					<span class="mt-3 text-xs text-foreground-subtle">Memuat data monitoring pesanan...</span>
				</div>
			{:else if orderStore.error}
				<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
					<IconAlertTriangle class="size-8" />
					<span class="mt-2 text-sm font-semibold">Gagal memuat daftar pesanan</span>
					<span class="mt-1 text-xs text-foreground-subtle">{orderStore.error}</span>
					<Button
						variant="outline"
						size="sm"
						onclick={() => orderStore.load()}
						class="mt-4 rounded-md text-xs font-semibold"
					>
						Coba Lagi
					</Button>
				</div>
			{:else if orderStore.filteredOrders.length === 0}
				<div class="py-12">
					<EmptyState>
						{#snippet icon()}
							<div
								class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<IconReceipt class="size-6" />
							</div>
						{/snippet}
						{#snippet title()}
							<span class="text-sm font-semibold text-foreground">Tidak Ada Pesanan Ditemukan</span>
						{/snippet}
						{#snippet description()}
							<span class="text-xs text-foreground-subtle">
								{orderStore.searchQuery
									? `Tidak ada pesanan yang cocok dengan kata kunci "${orderStore.searchQuery}".`
									: 'Belum ada nota transaksi pada filter status yang dipilih.'}
							</span>
						{/snippet}
						{#if orderStore.searchQuery || orderStore.statusFilter !== 'ALL' || orderStore.orderTypeFilter !== 'ALL'}
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									orderStore.setSearch('');
									orderStore.setStatusFilter('ALL');
									orderStore.setOrderTypeFilter('ALL');
								}}
								class="mt-2 rounded-md text-xs font-semibold"
							>
								Reset Semua Filter
							</Button>
						{/if}
					</EmptyState>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<Table class="rounded-none border-0 bg-transparent">
						<TableHeader>
							<TableRow class="border-b border-border bg-muted/40 hover:bg-transparent">
								<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
									No. Invoice & Tipe
								</TableHead>
								<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
									No. SPK & Status
								</TableHead>
								<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
									Pelanggan
								</TableHead>
								<TableHead class="h-9 px-4 text-right text-xs font-bold text-foreground-subtle">
									Total Tagihan
								</TableHead>
								<TableHead class="h-9 px-4 text-right text-xs font-bold text-foreground-subtle">
									Terbayar
								</TableHead>
								<TableHead class="h-9 px-4 text-right text-xs font-bold text-foreground-subtle">
									Sisa Piutang
								</TableHead>
								<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
									Jatuh Tempo
								</TableHead>
								<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
									Status
								</TableHead>
								<TableHead class="h-9 px-4 text-center text-xs font-bold text-foreground-subtle">
									Aksi
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each orderStore.filteredOrders as ord (ord.id)}
								{@const statusProps = getStatusBadgeProps(ord.status)}
								<TableRow
									class="border-b border-border/40 transition-colors duration-150 hover:bg-muted/30"
								>
									<!-- No. Invoice & Tipe -->
									<TableCell class="px-4 py-3 align-top">
										<div class="flex flex-col gap-1">
											<button
												type="button"
												onclick={() => openDetail(ord)}
												class="cursor-pointer text-left font-bold text-primary transition-colors hover:underline"
											>
												{ord.invoiceNumber}
											</button>
											<div class="flex items-center gap-1.5">
												{#if ord.orderType === 'PRODUCTION'}
													<span
														class="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-blue-600 dark:text-blue-400"
													>
														<IconLayers class="size-2.5" />
														<span>Produksi</span>
													</span>
												{:else}
													<span
														class="inline-flex items-center gap-1 rounded bg-orange-500/10 px-1.5 py-0.2 text-[9px] font-bold text-orange-600 dark:text-orange-400"
													>
														<IconShoppingBag class="size-2.5" />
														<span>Ritel</span>
													</span>
												{/if}
												<span class="text-[10px] text-foreground-subtle">
													{ord.items.length} item
												</span>
											</div>
										</div>
									</TableCell>

									<!-- No. SPK Terkait & Status Pengerjaan -->
									<TableCell class="px-4 py-3 align-top">
										<div class="flex flex-col gap-1">
											<span class="font-semibold text-foreground">{ord.jobNumber}</span>
											<div class="flex flex-wrap items-center gap-1">
												{#if ord.fulfillmentStatus === 'READY_FOR_PICKUP'}
													<span
														class="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-300"
													>
														<IconPackage class="size-2.5" />
														<span>Siap Ambil</span>
														{#if ord.rackLocation}
															<span class="text-amber-600/70 dark:text-amber-400/70">({ord.rackLocation})</span>
														{/if}
													</span>
												{:else if ord.fulfillmentStatus === 'PROCESSING'}
													<span
														class="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
													>
														<IconPrinter class="size-2.5" />
														<span>Sedang Diproses</span>
													</span>
												{:else if ord.fulfillmentStatus === 'PICKED_UP'}
													<span
														class="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
													>
														<IconCheckCircle2 class="size-2.5" />
														<span>Sudah Diambil</span>
													</span>
												{/if}
											</div>
											<span class="text-[10px] text-foreground-subtle">
												{formatOrderDateTime(ord.issuedAt)}
											</span>
										</div>
									</TableCell>

									<!-- Pelanggan -->
									<TableCell class="px-4 py-3 align-top">
										<div class="flex flex-col">
											<div class="flex items-center gap-1.5">
												<span class="font-bold text-foreground">{ord.customerName}</span>
												{#if ord.customerType === 'reseller'}
													<span
														class="rounded bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"
													>
														Reseller
													</span>
												{/if}
											</div>
											<span class="text-[10px] text-foreground-subtle">
												{ord.customerPhone}
											</span>
										</div>
									</TableCell>

									<!-- Total Tagihan -->
									<TableCell class="px-4 py-3 text-right align-top font-bold text-foreground">
										{formatCurrency(ord.subtotal)}
									</TableCell>

									<!-- Terbayar -->
									<TableCell
										class="px-4 py-3 text-right align-top font-bold text-emerald-600 dark:text-emerald-400"
									>
										{formatCurrency(ord.totalPaid)}
									</TableCell>

									<!-- Sisa Piutang -->
									<TableCell class="px-4 py-3 text-right align-top font-bold">
										{#if ord.remainingAmount > 0}
											<span
												class={ord.status === 'OVERDUE'
													? 'text-rose-600 dark:text-rose-400'
													: 'text-amber-600 dark:text-amber-400'}
											>
												{formatCurrency(ord.remainingAmount)}
											</span>
										{:else}
											<span class="text-foreground-subtle">-</span>
										{/if}
									</TableCell>

									<!-- Jatuh Tempo -->
									<TableCell class="px-4 py-3 align-top">
										{#if ord.dueDate}
											<div class="flex flex-col">
												<span
													class="font-semibold {ord.status === 'OVERDUE'
														? 'text-rose-600 dark:text-rose-400'
														: 'text-foreground'}"
												>
													{formatOrderDateTime(ord.dueDate)}
												</span>
												{#if ord.status === 'OVERDUE'}
													<span class="text-[10px] font-bold text-rose-500">
														Lewat Jatuh Tempo
													</span>
												{/if}
											</div>
										{:else}
											<span class="text-foreground-subtle">Lunas Saat Ambil</span>
										{/if}
									</TableCell>

									<!-- Status -->
									<TableCell class="px-4 py-3 align-top">
										<Badge variant={statusProps.variant} size="sm">
											{statusProps.label}
										</Badge>
									</TableCell>

									<!-- Aksi -->
									<TableCell class="px-4 py-3 align-top">
										<div class="flex items-center justify-center gap-1">
											<!-- Detail -->
											<button
												type="button"
												onclick={() => openDetail(ord)}
												title="Lihat Rincian Pesanan"
												class="hover:bg-muted cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:text-foreground"
											>
												<IconEye class="size-4" />
											</button>

											<!-- Cetak Struk/Faktur -->
											<button
												type="button"
												onclick={() => openReceipt(ord)}
												title="Cetak Struk / Faktur"
												class="hover:bg-muted cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:text-foreground"
											>
												<IconPrinter class="size-4" />
											</button>

											<!-- Pelunasan Sisa (if remaining > 0) -->
											{#if ord.remainingAmount > 0}
												<button
													type="button"
													onclick={() => openPayment(ord)}
													title="Catat Pelunasan Sisa"
													class="cursor-pointer rounded-md p-1.5 text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
												>
													<IconCreditCard class="size-4" />
												</button>
											{/if}
										</div>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>

				<!-- Table Footer Stats Bar -->
				<div
					class="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-2.5 text-xs text-foreground-subtle sm:flex-row sm:items-center sm:justify-between"
				>
					<span>
						Menampilkan <strong>{orderStore.filteredOrders.length}</strong> dari <strong>{orderStore.orders.length}</strong> pesanan
					</span>
					<div class="flex items-center gap-4 text-[11px]">
						<span>
							Subtotal Terfilter: <strong class="text-foreground"
								>{formatCurrency(
									orderStore.filteredOrders.reduce((acc, o) => acc + o.subtotal, 0)
								)}</strong
							>
						</span>
						<span>
							Sisa Terfilter: <strong class="text-rose-600 dark:text-rose-400"
								>{formatCurrency(
									orderStore.filteredOrders.reduce((acc, o) => acc + o.remainingAmount, 0)
								)}</strong
							>
						</span>
					</div>
				</div>
			{/if}
		</Card>
	</div>
</div>

<!-- Modal: Rincian Pesanan Lengkap -->
<OrderDetailDialog
	open={isDetailOpen}
	order={selectedOrderForDetail}
	onClose={() => {
		isDetailOpen = false;
		selectedOrderForDetail = null;
	}}
	onOpenPayment={(ord) => openPayment(ord)}
	onOpenReceipt={(ord) => openReceipt(ord)}
/>

<!-- Modal: Pelunasan Tagihan Sisa -->
<OrderPaymentDialog
	open={isPaymentOpen}
	order={selectedOrderForPayment}
	onClose={() => {
		isPaymentOpen = false;
		selectedOrderForPayment = null;
	}}
	onSuccess={() => {
		// Store automatically updates
	}}
/>

<!-- Modal: Cetak Struk POS & Faktur A4 -->
<OrderReceiptDialog
	open={isReceiptOpen}
	order={selectedOrderForReceipt}
	onClose={() => {
		isReceiptOpen = false;
		selectedOrderForReceipt = null;
	}}
/>
