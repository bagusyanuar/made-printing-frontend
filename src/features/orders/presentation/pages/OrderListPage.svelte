<script lang="ts">
	import { onMount } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Card, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { EmptyState } from 'dystopia-linear-lib/components/empty-state';
	import { Spinner } from 'dystopia-linear-lib/components/spinner';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from 'dystopia-linear-lib/components/tabs';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell
	} from 'dystopia-linear-lib/components/table';
	import { toast } from 'dystopia-linear-lib/components/toast';
	import { TablePagination } from '$lib/components/table-pagination';

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
	import IconClock from '~icons/lucide/clock';
	import IconBan from '~icons/lucide/ban';
	import IconRotateCcw from '~icons/lucide/rotate-ccw';

	import type { Order, OrderPaymentStatus } from '../../domain/order.entity';
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

	// Pagination states
	let activeCurrentPage = $state(1);
	let activePageSize = $state(10);

	let completedCurrentPage = $state(1);
	let completedPageSize = $state(10);

	const paginatedActiveOrders = $derived.by(() => {
		const start = (activeCurrentPage - 1) * activePageSize;
		return orderStore.filteredActiveOrders.slice(start, start + activePageSize);
	});

	const paginatedCompletedOrders = $derived.by(() => {
		const start = (completedCurrentPage - 1) * completedPageSize;
		return orderStore.filteredCompletedOrders.slice(start, start + completedPageSize);
	});

	onMount(() => {
		orderStore.load();
	});

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
		const tabName = orderStore.mainTab === 'ACTIVE' ? 'Nota Aktif' : 'Nota Selesai';

		if (list.length === 0) {
			toast.info(`Tidak ada data ${tabName} untuk diekspor`);
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
			`rekap-pesanan-${orderStore.mainTab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success(`Rekap ${tabName} berhasil diekspor`, {
			description: `${list.length} baris data pesanan (${tabName}) telah diunduh sebagai file CSV.`
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
					Monitoring pengerjaan nota aktif (antrean mesin, workshop, rak kasir) dan riwayat nota
					selesai.
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
		<button
			type="button"
			onclick={() => {
				orderStore.setMainTab('ACTIVE');
				orderStore.resetActiveFilters();
			}}
			class="text-left"
		>
			<Card
				class="group relative overflow-hidden rounded-xl border bg-app-surface transition-all duration-200 hover:shadow-xs {orderStore.mainTab ===
					'ACTIVE' && orderStore.activeFulfillmentFilter === 'ALL'
					? 'border-primary ring-1 ring-primary/40'
					: 'border-border/80 hover:border-border'}"
			>
				<CardContent class="p-4 sm:p-4.5">
					<div class="flex items-start justify-between gap-3">
						<div class="flex flex-col">
							<span
								class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase"
							>
								Total Pesanan Aktif
							</span>
							<div class="mt-1 flex items-baseline gap-1.5">
								<span class="text-2xl font-bold tracking-tight text-foreground">
									{orderStore.activeCount}
								</span>
								<span class="text-xs font-semibold text-foreground-subtle"> Pesanan </span>
							</div>
						</div>
						<div
							class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 transition-transform duration-200 group-hover:scale-105 dark:text-blue-400"
						>
							<IconLayers class="size-4.5" />
						</div>
					</div>
					<div
						class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
					>
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
		</button>

		<!-- Card 2: Sedang Diproses Workshop -->
		<button
			type="button"
			onclick={() => {
				orderStore.setMainTab('ACTIVE');
				orderStore.setActiveFulfillmentFilter('PROCESSING');
			}}
			class="text-left"
		>
			<Card
				class="group relative overflow-hidden rounded-xl border bg-app-surface transition-all duration-200 hover:shadow-xs {orderStore.mainTab ===
					'ACTIVE' && orderStore.activeFulfillmentFilter === 'PROCESSING'
					? 'border-indigo-600 ring-1 ring-indigo-600/40'
					: 'border-border/80 hover:border-border'}"
			>
				<CardContent class="p-4 sm:p-4.5">
					<div class="flex items-start justify-between gap-3">
						<div class="flex flex-col">
							<span
								class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase"
							>
								Sedang Diproses
							</span>
							<div class="mt-1 flex items-baseline gap-1.5">
								<span
									class="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
								>
									{orderStore.processingCount}
								</span>
								<span class="text-xs font-semibold text-foreground-subtle"> Pesanan </span>
							</div>
						</div>
						<div
							class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 transition-transform duration-200 group-hover:scale-105 dark:text-indigo-400"
						>
							<IconPrinter class="size-4.5" />
						</div>
					</div>
					<div
						class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
					>
						<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
							<span class="size-1.5 rounded-full bg-indigo-500"></span>
							Antrean Mesin & Finishing
						</span>
						<span
							class="py-0.2 rounded bg-indigo-500/10 px-1.5 font-bold text-indigo-600 dark:text-indigo-400"
						>
							Workshop
						</span>
					</div>
				</CardContent>
			</Card>
		</button>

		<!-- Card 3: Siap Diambil di Rak -->
		<button
			type="button"
			onclick={() => {
				orderStore.setMainTab('ACTIVE');
				orderStore.setActiveFulfillmentFilter('READY_FOR_PICKUP');
			}}
			class="text-left"
		>
			<Card
				class="group relative overflow-hidden rounded-xl border bg-app-surface transition-all duration-200 hover:shadow-xs {orderStore.mainTab ===
					'ACTIVE' && orderStore.activeFulfillmentFilter === 'READY_FOR_PICKUP'
					? 'border-amber-600 ring-1 ring-amber-600/40'
					: 'border-border/80 hover:border-border'}"
			>
				<CardContent class="p-4 sm:p-4.5">
					<div class="flex items-start justify-between gap-3">
						<div class="flex flex-col">
							<span
								class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase"
							>
								Siap Diambil di Rak
							</span>
							<div class="mt-1 flex items-baseline gap-1.5">
								<span class="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
									{orderStore.readyCount}
								</span>
								<span class="text-xs font-semibold text-foreground-subtle"> Paket </span>
							</div>
						</div>
						<div
							class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 transition-transform duration-200 group-hover:scale-105 dark:text-amber-400"
						>
							<IconPackage class="size-4.5" />
						</div>
					</div>
					<div
						class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
					>
						<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
							<span class="size-1.5 rounded-full bg-amber-500"></span>
							Di Rak Kasir / Meja Depan
						</span>
						{#if orderStore.readyUnpaidCount > 0}
							<span
								class="py-0.2 rounded bg-amber-500/15 px-1.5 font-bold text-amber-700 dark:text-amber-300"
							>
								{orderStore.readyUnpaidCount} Perlu Pelunasan
							</span>
						{:else}
							<span
								class="py-0.2 rounded bg-emerald-500/10 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400"
							>
								Lunas Penuh
							</span>
						{/if}
					</div>
				</CardContent>
			</Card>
		</button>

		<!-- Card 4: Selesai Diambil -->
		<button
			type="button"
			onclick={() => {
				orderStore.setMainTab('COMPLETED');
				orderStore.resetCompletedFilters();
			}}
			class="text-left"
		>
			<Card
				class="group relative overflow-hidden rounded-xl border bg-app-surface transition-all duration-200 hover:shadow-xs {orderStore.mainTab ===
				'COMPLETED'
					? 'border-emerald-600 ring-1 ring-emerald-600/40'
					: 'border-border/80 hover:border-border'}"
			>
				<CardContent class="p-4 sm:p-4.5">
					<div class="flex items-start justify-between gap-3">
						<div class="flex flex-col">
							<span
								class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase"
							>
								Selesai Diambil
							</span>
							<div class="mt-1 flex items-baseline gap-1.5">
								<span
									class="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400"
								>
									{orderStore.pickedUpCount}
								</span>
								<span class="text-xs font-semibold text-foreground-subtle"> Pesanan </span>
							</div>
						</div>
						<div
							class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition-transform duration-200 group-hover:scale-105 dark:text-emerald-400"
						>
							<IconCheckCircle2 class="size-4.5" />
						</div>
					</div>
					<div
						class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
					>
						<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
							<span class="size-1.5 rounded-full bg-emerald-500"></span>
							Serah Terima Sukses
						</span>
						<span class="font-bold text-emerald-600 dark:text-emerald-400">
							{orderStore.completedCount} Total Selesai
						</span>
					</div>
				</CardContent>
			</Card>
		</button>
	</div>

	<!-- Primary Pills Tabs: Nota Aktif vs Nota Selesai -->
	<Tabs
		value={orderStore.mainTab}
		onValueChange={(val) => orderStore.setMainTab(val as 'ACTIVE' | 'COMPLETED')}
		class="flex flex-col gap-3"
	>
		<!-- Primary Pills Navigation Header -->
		<div
			class="flex flex-col gap-3 border-b border-border/70 pb-3 sm:flex-row sm:items-center sm:justify-between"
		>
			<TabsList
				variant="pill"
				class="inline-flex w-fit items-center gap-0.5 rounded-lg border border-border bg-app-surface p-0.5 shadow-none"
			>
				<TabsTrigger
					value="ACTIVE"
					class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5! py-1! text-xs! font-semibold transition-colors data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=inactive]:text-foreground-subtle data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:text-foreground"
				>
					<IconLayers class="size-3.5 shrink-0" />
					<span>Nota Aktif</span>
					<span
						class="py-0.2 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors {orderStore.mainTab ===
						'ACTIVE'
							? 'bg-primary-foreground/20 text-primary-foreground'
							: 'bg-muted text-foreground-subtle'}"
					>
						{orderStore.activeCount}
					</span>
				</TabsTrigger>

				<TabsTrigger
					value="COMPLETED"
					class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5! py-1! text-xs! font-semibold transition-colors data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=inactive]:text-foreground-subtle data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:text-foreground"
				>
					<IconCheckCircle2 class="size-3.5 shrink-0" />
					<span>Nota Selesai</span>
					<span
						class="py-0.2 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors {orderStore.mainTab ===
						'COMPLETED'
							? 'bg-primary-foreground/20 text-primary-foreground'
							: 'bg-muted text-foreground-subtle'}"
					>
						{orderStore.completedCount}
					</span>
				</TabsTrigger>
			</TabsList>

			<!-- Right Status Banner -->
			<div class="text-xs text-foreground-subtle">
				{#if orderStore.mainTab === 'ACTIVE'}
					<span class="inline-flex items-center gap-1.5">
						<span class="size-2 animate-pulse rounded-full bg-blue-500"></span>
						Tracking antrean mesin, pengerjaan workshop, & rak kasir
					</span>
				{:else}
					<span class="inline-flex items-center gap-1.5">
						<span class="size-2 rounded-full bg-emerald-500"></span>
						Arsip riwayat nota pesanan yang telah tuntas diambil / dibatalkan
					</span>
				{/if}
			</div>
		</div>

		<!-- ============================================================== -->
		<!-- TAB 1: NOTA AKTIF (DEDICATED TOOLBAR & ACTIVE DATA TABLE)     -->
		<!-- ============================================================== -->
		<TabsContent value="ACTIVE" class="flex flex-col gap-3">
			<!-- Toolbar: Nota Aktif -->
			<div class="flex items-center justify-between gap-3">
				<!-- Search Input on Left -->
				<div class="relative w-full sm:w-72">
					<TextField
						size="sm"
						placeholder="Cari invoice, SPK, pelanggan, rak..."
						value={orderStore.activeSearchQuery}
						onValueChange={(val) => {
							orderStore.setActiveSearch(val);
							activeCurrentPage = 1;
						}}
						class="w-full pl-8"
					/>
					<div
						class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground-subtle"
					>
						<IconSearch class="size-3.5" />
					</div>
					{#if orderStore.activeSearchQuery.trim()}
						<button
							type="button"
							onclick={() => {
								orderStore.setActiveSearch('');
								activeCurrentPage = 1;
							}}
							class="hover:bg-muted absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-0.5 text-foreground-subtle"
							aria-label="Bersihkan pencarian"
						>
							<IconX class="size-3" />
						</button>
					{/if}
				</div>

				<!-- Actions on Right: Refresh (Icon only) -->
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onclick={() => orderStore.refresh()}
						disabled={orderStore.isLoading}
						aria-label="Segarkan data nota aktif"
						title="Segarkan data nota aktif"
						class="size-8 justify-center! p-0!"
					>
						<IconRefreshCw
							class="size-4 text-foreground-subtle transition-transform {orderStore.isLoading
								? 'animate-spin'
								: ''}"
						/>
					</Button>
				</div>
			</div>

			<!-- Table Card: Nota Aktif -->
			<Card class="overflow-hidden border border-border bg-app-surface shadow-none">
				{#if orderStore.isLoading && orderStore.orders.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<Spinner class="size-8 text-primary" />
						<Typography variant="small" as="span" class="mt-3 text-xs text-foreground-subtle">
							Memuat data pesanan aktif...
						</Typography>
					</div>
				{:else if orderStore.error}
					<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
						<IconAlertTriangle class="size-8" />
						<Typography variant="body" as="span" class="mt-2 text-sm font-semibold">
							Gagal memuat daftar pesanan
						</Typography>
						<Typography variant="small" as="span" class="mt-1 text-xs text-foreground-subtle">
							{orderStore.error}
						</Typography>
						<Button
							variant="outline"
							size="sm"
							onclick={() => orderStore.load()}
							class="mt-4 rounded-md text-xs font-semibold"
						>
							Coba Lagi
						</Button>
					</div>
				{:else if orderStore.filteredActiveOrders.length === 0}
					<div class="py-12">
						<EmptyState>
							{#snippet icon()}
								<div
									class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
								>
									<IconLayers class="size-6" />
								</div>
							{/snippet}
							{#snippet title()}
								<Typography variant="h4" as="span" class="text-sm font-semibold text-foreground">
									Tidak Ada Pesanan Aktif
								</Typography>
							{/snippet}
							{#snippet description()}
								<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
									{orderStore.activeSearchQuery
										? `Tidak ada pesanan aktif yang cocok dengan kata kunci "${orderStore.activeSearchQuery}".`
										: 'Belum ada nota pesanan aktif saat ini.'}
								</Typography>
							{/snippet}
							{#if orderStore.activeSearchQuery || orderStore.activeFulfillmentFilter !== 'ALL' || orderStore.activeOrderTypeFilter !== 'ALL' || orderStore.activePaymentFilter !== 'ALL'}
								<Button
									variant="outline"
									size="sm"
									onclick={() => orderStore.resetActiveFilters()}
									class="mt-2 rounded-md text-xs font-semibold"
								>
									Reset Pencarian
								</Button>
							{/if}
						</EmptyState>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<Table class="rounded-none border-0 bg-transparent">
							<TableHeader>
								<TableRow class="bg-muted/40 border-b border-border hover:bg-transparent">
									<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
										No. Invoice & Tipe
									</TableHead>
									<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
										No. SPK & Status Pengerjaan
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
								{#each paginatedActiveOrders as ord (ord.id)}
									{@const statusProps = getStatusBadgeProps(ord.status)}
									<TableRow
										class="hover:bg-muted/30 border-b border-border/40 transition-colors duration-150"
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
															class="py-0.2 inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400"
														>
															<IconLayers class="size-2.5" />
															<span>Produksi</span>
														</span>
													{:else}
														<span
															class="py-0.2 inline-flex items-center gap-1 rounded bg-orange-500/10 px-1.5 text-[9px] font-bold text-orange-600 dark:text-orange-400"
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

										<!-- No. SPK Terkait & Status Pengerjaan Aktif -->
										<TableCell class="px-4 py-3 align-top">
											<div class="flex flex-col gap-1">
												<span class="font-semibold text-foreground">{ord.jobNumber}</span>
												<div class="flex flex-wrap items-center gap-1">
													{#if ord.fulfillmentStatus === 'QUEUED'}
														<span
															class="py-0.2 inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300"
														>
															<IconClock class="size-2.5" />
															<span>Menunggu Antrean</span>
														</span>
													{:else if ord.fulfillmentStatus === 'PROCESSING'}
														<span
															class="py-0.2 inline-flex items-center gap-1 rounded bg-indigo-500/10 px-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
														>
															<IconPrinter class="size-2.5" />
															<span>Sedang Diproses</span>
														</span>
													{:else if ord.fulfillmentStatus === 'READY_FOR_PICKUP'}
														<span
															class="py-0.2 inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-300"
														>
															<IconPackage class="size-2.5" />
															<span>Siap Ambil</span>
															{#if ord.rackLocation}
																<span class="text-amber-600/70 dark:text-amber-400/70">
																	({ord.rackLocation})
																</span>
															{/if}
														</span>
													{/if}
												</div>
												<span class="text-[10px] text-foreground-subtle">
													Dibuat: {formatOrderDateTime(ord.issuedAt)}
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
															class="py-0.2 rounded bg-indigo-500/10 px-1.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"
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

										<!-- Status Pembayaran -->
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
				{/if}
			</Card>

			{#if !orderStore.isLoading && !orderStore.error && orderStore.filteredActiveOrders.length > 0}
				<!-- Pagination & Table Controls -->
				<TablePagination
					bind:currentPage={activeCurrentPage}
					bind:pageSize={activePageSize}
					totalItems={orderStore.filteredActiveOrders.length}
					pageSizeOptions={[5, 10, 20, 50]}
					itemLabel="nota aktif"
				/>
			{/if}
		</TabsContent>

		<!-- ============================================================== -->
		<!-- TAB 2: NOTA SELESAI (DEDICATED TOOLBAR & COMPLETED DATA TABLE) -->
		<!-- ============================================================== -->
		<TabsContent value="COMPLETED" class="flex flex-col gap-3">
			<!-- Toolbar: Nota Selesai -->
			<div class="flex flex-col gap-3">
				<!-- Row 1: Status Selesai Filter (Sudah Diambil vs Dibatalkan) -->
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div class="flex flex-wrap items-center gap-1.5">
						<!-- Semua Selesai -->
						<button
							type="button"
							onclick={() => orderStore.setCompletedStatusFilter('ALL')}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all {orderStore.completedStatusFilter ===
							'ALL'
								? 'border-primary bg-primary text-primary-foreground shadow-xs'
								: 'border-border bg-app-surface text-foreground-subtle hover:border-primary/40 hover:text-foreground'}"
						>
							<span>Semua Selesai</span>
							<span
								class="py-0.2 rounded-full px-1.5 text-[10px] {orderStore.completedStatusFilter ===
								'ALL'
									? 'bg-primary-foreground/20 text-primary-foreground'
									: 'bg-muted text-foreground-subtle'}"
							>
								{orderStore.completedCount}
							</span>
						</button>

						<!-- Sudah Diambil -->
						<button
							type="button"
							onclick={() => orderStore.setCompletedStatusFilter('PICKED_UP')}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all {orderStore.completedStatusFilter ===
							'PICKED_UP'
								? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
								: 'border-border bg-app-surface text-foreground-subtle hover:border-emerald-500/40 hover:text-foreground'}"
						>
							<IconCheckCircle2 class="size-3.5" />
							<span>Sudah Diambil (Serah Terima)</span>
							{#if orderStore.pickedUpCount > 0}
								<span
									class="py-0.2 rounded-full px-1.5 text-[10px] {orderStore.completedStatusFilter ===
									'PICKED_UP'
										? 'bg-white/20 text-white'
										: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}"
								>
									{orderStore.pickedUpCount}
								</span>
							{/if}
						</button>

						<!-- Dibatalkan -->
						<button
							type="button"
							onclick={() => orderStore.setCompletedStatusFilter('CANCELLED')}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all {orderStore.completedStatusFilter ===
							'CANCELLED'
								? 'border-rose-600 bg-rose-600 text-white shadow-xs'
								: 'border-border bg-app-surface text-foreground-subtle hover:border-rose-500/40 hover:text-foreground'}"
						>
							<IconBan class="size-3.5" />
							<span>Dibatalkan</span>
							{#if orderStore.cancelledCount > 0}
								<span
									class="py-0.2 rounded-full px-1.5 text-[10px] {orderStore.completedStatusFilter ===
									'CANCELLED'
										? 'bg-white/20 text-white'
										: 'bg-rose-500/15 text-rose-700 dark:text-rose-300'}"
								>
									{orderStore.cancelledCount}
								</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Row 2: Secondary Filters & Search -->
				<div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex flex-wrap items-center gap-2">
						<!-- Tipe Order: Semua | Produksi | Ritel -->
						<div class="flex items-center rounded-lg border border-border bg-app-surface p-0.5">
							<button
								type="button"
								onclick={() => orderStore.setCompletedOrderTypeFilter('ALL')}
								class="rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.completedOrderTypeFilter ===
								'ALL'
									? 'bg-primary text-primary-foreground'
									: 'text-foreground-subtle hover:text-foreground'}"
							>
								Semua Tipe
							</button>
							<button
								type="button"
								onclick={() => orderStore.setCompletedOrderTypeFilter('PRODUCTION')}
								class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.completedOrderTypeFilter ===
								'PRODUCTION'
									? 'bg-primary text-primary-foreground'
									: 'text-foreground-subtle hover:text-foreground'}"
							>
								<IconLayers class="size-3" />
								<span>Produksi</span>
							</button>
							<button
								type="button"
								onclick={() => orderStore.setCompletedOrderTypeFilter('RETAIL')}
								class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.completedOrderTypeFilter ===
								'RETAIL'
									? 'bg-primary text-primary-foreground'
									: 'text-foreground-subtle hover:text-foreground'}"
							>
								<IconShoppingBag class="size-3" />
								<span>Ritel</span>
							</button>
						</div>

						<!-- Filter Status Tagihan: Semua | Lunas | Ada Piutang -->
						<div class="flex items-center rounded-lg border border-border bg-app-surface p-0.5">
							<button
								type="button"
								onclick={() => orderStore.setCompletedPaymentFilter('ALL')}
								class="rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.completedPaymentFilter ===
								'ALL'
									? 'bg-primary text-primary-foreground'
									: 'text-foreground-subtle hover:text-foreground'}"
							>
								Semua Tagihan
							</button>
							<button
								type="button"
								onclick={() => orderStore.setCompletedPaymentFilter('LUNAS')}
								class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.completedPaymentFilter ===
								'LUNAS'
									? 'bg-emerald-600 text-white'
									: 'text-foreground-subtle hover:text-foreground'}"
							>
								<span>Lunas Penuh</span>
							</button>
							<button
								type="button"
								onclick={() => orderStore.setCompletedPaymentFilter('UNSETTLED')}
								class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {orderStore.completedPaymentFilter ===
								'UNSETTLED'
									? 'bg-amber-600 text-white'
									: 'text-foreground-subtle hover:text-foreground'}"
							>
								<span>Piutang / Tempo</span>
							</button>
						</div>

						<!-- Reset Completed Filters if active -->
						{#if orderStore.completedStatusFilter !== 'ALL' || orderStore.completedOrderTypeFilter !== 'ALL' || orderStore.completedPaymentFilter !== 'ALL' || orderStore.completedSearchQuery.trim()}
							<Button
								variant="ghost"
								size="sm"
								onclick={() => orderStore.resetCompletedFilters()}
								class="h-7 gap-1 px-2 text-xs font-medium text-foreground-subtle hover:text-foreground"
							>
								<IconRotateCcw class="size-3" />
								<span>Reset</span>
							</Button>
						{/if}
					</div>

					<!-- Search Input -->
					<div class="relative w-full sm:w-64">
						<TextField
							size="sm"
							placeholder="Cari invoice selesai, nama pengambil..."
							value={orderStore.completedSearchQuery}
							onValueChange={(val) => {
								orderStore.setCompletedSearch(val);
								completedCurrentPage = 1;
							}}
							class="w-full pl-8"
						/>
						<div
							class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground-subtle"
						>
							<IconSearch class="size-3.5" />
						</div>
						{#if orderStore.completedSearchQuery.trim()}
							<button
								type="button"
								onclick={() => {
									orderStore.setCompletedSearch('');
									completedCurrentPage = 1;
								}}
								class="hover:bg-muted absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-0.5 text-foreground-subtle"
								aria-label="Bersihkan pencarian"
							>
								<IconX class="size-3" />
							</button>
						{/if}
					</div>
				</div>
			</div>

			<!-- Table Card: Nota Selesai -->
			<Card class="overflow-hidden border border-border bg-app-surface shadow-none">
				{#if orderStore.isLoading && orderStore.orders.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<Spinner class="size-8 text-primary" />
						<Typography variant="small" as="span" class="mt-3 text-xs text-foreground-subtle">
							Memuat data arsip nota selesai...
						</Typography>
					</div>
				{:else if orderStore.error}
					<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
						<IconAlertTriangle class="size-8" />
						<Typography variant="body" as="span" class="mt-2 text-sm font-semibold">
							Gagal memuat arsip nota selesai
						</Typography>
						<Typography variant="small" as="span" class="mt-1 text-xs text-foreground-subtle">
							{orderStore.error}
						</Typography>
						<Button
							variant="outline"
							size="sm"
							onclick={() => orderStore.load()}
							class="mt-4 rounded-md text-xs font-semibold"
						>
							Coba Lagi
						</Button>
					</div>
				{:else if orderStore.filteredCompletedOrders.length === 0}
					<div class="py-12">
						<EmptyState>
							{#snippet icon()}
								<div
									class="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
								>
									<IconCheckCircle2 class="size-6" />
								</div>
							{/snippet}
							{#snippet title()}
								<Typography variant="h4" as="span" class="text-sm font-semibold text-foreground">
									Tidak Ada Nota Selesai Ditemukan
								</Typography>
							{/snippet}
							{#snippet description()}
								<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
									{orderStore.completedSearchQuery
										? `Tidak ada nota selesai yang cocok dengan kata kunci "${orderStore.completedSearchQuery}".`
										: 'Belum ada riwayat pesanan yang selesai diambil atau dibatalkan pada filter ini.'}
								</Typography>
							{/snippet}
							{#if orderStore.completedSearchQuery || orderStore.completedStatusFilter !== 'ALL' || orderStore.completedOrderTypeFilter !== 'ALL' || orderStore.completedPaymentFilter !== 'ALL'}
								<Button
									variant="outline"
									size="sm"
									onclick={() => orderStore.resetCompletedFilters()}
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
								<TableRow class="bg-muted/40 border-b border-border hover:bg-transparent">
									<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
										No. Invoice & Tipe
									</TableHead>
									<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
										No. SPK & Status Akhir
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
										Tanggal Selesai
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
								{#each paginatedCompletedOrders as ord (ord.id)}
									{@const statusProps = getStatusBadgeProps(ord.status)}
									<TableRow
										class="hover:bg-muted/30 border-b border-border/40 transition-colors duration-150"
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
															class="py-0.2 inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400"
														>
															<IconLayers class="size-2.5" />
															<span>Produksi</span>
														</span>
													{:else}
														<span
															class="py-0.2 inline-flex items-center gap-1 rounded bg-orange-500/10 px-1.5 text-[9px] font-bold text-orange-600 dark:text-orange-400"
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

										<!-- No. SPK & Status Akhir -->
										<TableCell class="px-4 py-3 align-top">
											<div class="flex flex-col gap-1">
												<span class="font-semibold text-foreground">{ord.jobNumber}</span>
												<div class="flex flex-wrap items-center gap-1">
													{#if ord.fulfillmentStatus === 'PICKED_UP'}
														<span
															class="py-0.2 inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
														>
															<IconCheckCircle2 class="size-2.5" />
															<span>Sudah Diambil</span>
														</span>
														{#if ord.pickedUpBy}
															<span class="text-[10px] text-foreground-subtle">
																Oleh: {ord.pickedUpBy}
															</span>
														{/if}
													{:else if ord.status === 'CANCELLED'}
														<span
															class="py-0.2 inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400"
														>
															<IconBan class="size-2.5" />
															<span>Dibatalkan</span>
														</span>
														{#if ord.cancelReason}
															<span
																class="line-clamp-1 max-w-45 text-[10px] text-foreground-subtle"
																title={ord.cancelReason}
															>
																{ord.cancelReason}
															</span>
														{/if}
													{/if}
												</div>
											</div>
										</TableCell>

										<!-- Pelanggan -->
										<TableCell class="px-4 py-3 align-top">
											<div class="flex flex-col">
												<div class="flex items-center gap-1.5">
													<span class="font-bold text-foreground">{ord.customerName}</span>
													{#if ord.customerType === 'reseller'}
														<span
															class="py-0.2 rounded bg-indigo-500/10 px-1.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"
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

										<!-- Tanggal Selesai -->
										<TableCell class="px-4 py-3 align-top">
											<span class="text-xs text-foreground">
												{formatOrderDateTime(ord.pickedUpAt || ord.cancelledAt || ord.updatedAt)}
											</span>
										</TableCell>

										<!-- Status Pembayaran -->
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

												<!-- Cetak Struk / Faktur -->
												<button
													type="button"
													onclick={() => openReceipt(ord)}
													title="Cetak Salinan Faktur / Struk"
													class="hover:bg-muted cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:text-foreground"
												>
													<IconPrinter class="size-4" />
												</button>

												<!-- Pelunasan Sisa if any -->
												{#if ord.remainingAmount > 0 && ord.status !== 'CANCELLED'}
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
				{/if}
			</Card>

			{#if !orderStore.isLoading && !orderStore.error && orderStore.filteredCompletedOrders.length > 0}
				<!-- Pagination & Table Controls -->
				<TablePagination
					bind:currentPage={completedCurrentPage}
					bind:pageSize={completedPageSize}
					totalItems={orderStore.filteredCompletedOrders.length}
					pageSizeOptions={[5, 10, 20, 50]}
					itemLabel="nota selesai"
				/>
			{/if}
		</TabsContent>
	</Tabs>
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
