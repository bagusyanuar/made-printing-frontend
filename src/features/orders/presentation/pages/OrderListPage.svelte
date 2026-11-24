<script lang="ts">
	import { onMount } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Card, CardContent } from 'dystopia-linear-lib/components/card';
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
	import { Popover } from 'dystopia-linear-lib/components/popover';
	import { Dropdown, DropdownItem } from 'dystopia-linear-lib/components/dropdown';
	import { Checkbox } from 'dystopia-linear-lib/components/checkbox';

	import IconReceipt from '~icons/lucide/receipt';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import IconAlertCircle from '~icons/lucide/alert-circle';
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
	import IconFileText from '~icons/lucide/file-text';
	import IconFilter from '~icons/lucide/filter';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconChevronDown from '~icons/lucide/chevron-down';
	import IconCheck from '~icons/lucide/check';

	import type {
		Order,
		OrderPaymentStatus,
		OrderFulfillmentStatus
	} from '../../domain/order.entity';
	import { formatCurrency, formatOrderDateTime } from '../../domain/order.entity';
	import { orderStore } from '../../application/order.store.svelte';

	import OrderDetailDialog from '../components/OrderDetailDialog.svelte';
	import OrderPaymentDialog from '../components/OrderPaymentDialog.svelte';
	import OrderReceiptDialog from '../components/OrderReceiptDialog.svelte';
	import OrderCancelDialog from '../components/OrderCancelDialog.svelte';

	// Dialog states
	let isDetailOpen = $state(false);
	let selectedOrderForDetail = $state<Order | null>(null);

	let isPaymentOpen = $state(false);
	let selectedOrderForPayment = $state<Order | null>(null);

	let isReceiptOpen = $state(false);
	let selectedOrderForReceipt = $state<Order | null>(null);

	let isCancelOpen = $state(false);
	let selectedOrderForCancel = $state<Order | null>(null);

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

	let isFilterPopoverOpen = $state(false);

	const activeFiltersCount = $derived(
		orderStore.activeFulfillmentFilters.length + orderStore.activePaymentFilters.length
	);

	const fulfillmentFilterOptions: { value: OrderFulfillmentStatus; label: string }[] = [
		{ value: 'CREATED', label: 'Pesanan Dibuat' },
		{ value: 'QUEUED', label: 'Antrean Produksi' },
		{ value: 'PROCESSING', label: 'Di Proses' },
		{ value: 'READY_FOR_PICKUP', label: 'Siap Diambil' }
	];

	const paymentFilterOptions: { value: OrderPaymentStatus; label: string }[] = [
		{ value: 'LUNAS', label: 'Lunas' },
		{ value: 'PARTIAL_PAID', label: 'Bayar Sebagian' },
		{ value: 'UNPAID', label: 'Belum DiBayar' }
	];

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

	function openCancelModal(ord: Order) {
		selectedOrderForCancel = ord;
		isCancelOpen = true;
	}

	async function handleCancelConfirm(reason: string): Promise<boolean> {
		if (!selectedOrderForCancel) return false;
		const success = await orderStore.cancelOrder(selectedOrderForCancel.id, reason);
		if (success) {
			toast.success('Pesanan Dibatalkan', {
				description: `Nota ${selectedOrderForCancel.invoiceNumber} berhasil dibatalkan.`
			});
			return true;
		} else {
			toast.danger('Gagal Membatalkan Pesanan', {
				description: orderStore.error || 'Terjadi kesalahan sistem saat membatalkan pesanan.'
			});
			return false;
		}
	}

	async function handlePickup(ord: Order) {
		const success = await orderStore.markAsPickedUp(ord.id);
		if (success) {
			if (ord.remainingAmount > 0) {
				toast.info('Pesanan Diserahkan (Masuk Piutang)', {
					description: `Nota ${ord.invoiceNumber} berhasil diserahkan. Sisa tagihan Rp ${formatCurrency(ord.remainingAmount)} tercatat sebagai piutang pelanggan.`
				});
			} else {
				toast.success('Pesanan Berhasil Diserahkan', {
					description: `Nota ${ord.invoiceNumber} berhasil diserahkan ke pelanggan.`
				});
			}
		} else {
			toast.danger('Gagal Menyerahkan Pesanan', {
				description: orderStore.error || 'Terjadi kesalahan sistem.'
			});
		}
	}

	function getFulfillmentLabel(status: OrderFulfillmentStatus): string {
		switch (status) {
			case 'CREATED':
				return 'Pesanan Dibuat';
			case 'QUEUED':
				return 'Antrean Produksi';
			case 'PROCESSING':
				return 'Di Proses';
			case 'READY_FOR_PICKUP':
				return 'Siap Diambil';
			case 'PICKED_UP':
				return 'Sudah Diambil';
			default:
				return status;
		}
	}

	async function handleStatusChange(ord: Order, targetStatus: OrderFulfillmentStatus) {
		if (ord.fulfillmentStatus === targetStatus) return;

		// Serah Terima: Jika memilih PICKED_UP (Bisa diserahkan langsung, sisa otomatis jadi piutang)
		if (targetStatus === 'PICKED_UP') {
			const success = await orderStore.markAsPickedUp(ord.id);
			if (success) {
				if (ord.remainingAmount > 0) {
					toast.info('Pesanan Diserahkan (Masuk Piutang)', {
						description: `Status nota ${ord.invoiceNumber} diubah menjadi Sudah Diambil. Sisa tagihan Rp ${formatCurrency(ord.remainingAmount)} tercatat sebagai piutang pelanggan.`
					});
				} else {
					toast.success('Pesanan Selesai Diserahkan', {
						description: `Status nota ${ord.invoiceNumber} diubah menjadi Sudah Diambil dan dipindahkan ke Nota Selesai.`
					});
				}
			} else {
				toast.danger('Gagal Memperbarui Status', {
					description: orderStore.error || 'Terjadi kesalahan sistem.'
				});
			}
			return;
		}

		// Status lainnya (CREATED, QUEUED, PROCESSING, READY_FOR_PICKUP)
		const success = await orderStore.updateFulfillmentStatus(ord.id, targetStatus);
		if (success) {
			const targetLabel = getFulfillmentLabel(targetStatus);
			toast.success('Status Pesanan Diperbarui', {
				description: `Nota ${ord.invoiceNumber} sekarang berstatus "${targetLabel}".`
			});
		} else {
			toast.danger('Gagal Memperbarui Status', {
				description: orderStore.error || 'Terjadi kesalahan sistem.'
			});
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

{#snippet paymentChip(status: OrderPaymentStatus)}
	{#if status === 'LUNAS'}
		<span
			class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
		>
			<IconCheckCircle2 class="size-3 text-emerald-600 dark:text-emerald-400" />
			<span>Lunas</span>
		</span>
	{:else if status === 'PARTIAL_PAID'}
		<span
			class="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-300"
		>
			<IconCreditCard class="size-3 text-orange-600 dark:text-orange-400" />
			<span>Bayar Sebagian</span>
		</span>
	{:else if status === 'UNPAID' || status === 'OVERDUE'}
		<span
			class="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300"
		>
			<IconAlertCircle class="size-3 text-rose-600 dark:text-rose-400" />
			<span>Belum DiBayar</span>
		</span>
	{:else if status === 'CANCELLED'}
		<span
			class="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
		>
			<IconBan class="size-3 text-zinc-500 dark:text-zinc-400" />
			<span>Dibatalkan</span>
		</span>
	{:else}
		<span
			class="bg-muted/40 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground-subtle"
		>
			<span>{status}</span>
		</span>
	{/if}
{/snippet}

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
		<!-- Card 1: Pesanan Aktif -->
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
								Pesanan Aktif
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
							Total Pengerjaan Workshop
						</span>
						<span
							class="py-0.2 rounded bg-blue-500/10 px-1.5 font-bold text-blue-600 dark:text-blue-400"
						>
							Produksi
						</span>
					</div>
				</CardContent>
			</Card>
		</button>

		<!-- Card 2: Antrean Produksi -->
		<button
			type="button"
			onclick={() => {
				orderStore.setMainTab('ACTIVE');
				orderStore.setActiveFulfillmentFilter('QUEUED');
			}}
			class="text-left"
		>
			<Card
				class="group relative overflow-hidden rounded-xl border bg-app-surface transition-all duration-200 hover:shadow-xs {orderStore.mainTab ===
					'ACTIVE' && orderStore.activeFulfillmentFilter === 'QUEUED'
					? 'border-sky-600 ring-1 ring-sky-600/40'
					: 'border-border/80 hover:border-border'}"
			>
				<CardContent class="p-4 sm:p-4.5">
					<div class="flex items-start justify-between gap-3">
						<div class="flex flex-col">
							<span
								class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase"
							>
								Antrean Produksi
							</span>
							<div class="mt-1 flex items-baseline gap-1.5">
								<span class="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
									{orderStore.queuedCount}
								</span>
								<span class="text-xs font-semibold text-foreground-subtle"> Pesanan </span>
							</div>
						</div>
						<div
							class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-600 transition-transform duration-200 group-hover:scale-105 dark:text-sky-400"
						>
							<IconClock class="size-4.5" />
						</div>
					</div>
					<div
						class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
					>
						<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
							<span class="size-1.5 rounded-full bg-sky-500"></span>
							Menunggu Pra-Cetak & Plat
						</span>
						<span
							class="py-0.2 rounded bg-sky-500/10 px-1.5 font-bold text-sky-600 dark:text-sky-400"
						>
							Antrean
						</span>
					</div>
				</CardContent>
			</Card>
		</button>

		<!-- Card 3: Di Proses -->
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
								Di Proses
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
							Mesin Cetak & Finishing
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

		<!-- Card 4: Siap Diambil -->
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
								Siap Diambil
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
							Di Meja Kasir / Siap Ambil
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
					<span>Aktif</span>
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
					<span>Selesai</span>
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

				<!-- Actions on Right: Refresh + Filter Popover -->
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

					<!-- Filter Button with Popover -->
					<Popover
						bind:open={isFilterPopoverOpen}
						placement="bottom-end"
						offset={8}
						class="h-8! gap-1.5 rounded-md px-2.5! text-xs! font-semibold transition-colors {activeFiltersCount >
						0
							? 'border-primary/40! bg-primary/10! text-primary!'
							: 'hover:bg-muted text-foreground'}"
						classes={{
							content:
								'z-50 w-[300px] rounded-xl border border-border bg-app-surface p-3.5 text-xs shadow-xl'
						}}
						title="Filter status dan pembayaran"
					>
						{#snippet trigger()}
							<IconFilter class="size-3.5" />
							<span>Filter</span>
							{#if activeFiltersCount > 0}
								<span
									class="inline-flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
								>
									{activeFiltersCount}
								</span>
							{/if}
						{/snippet}

						<div class="flex flex-col gap-3">
							<!-- Header Popover -->
							<div class="flex items-center justify-between border-b border-border/70 pb-2">
								<div class="flex items-center gap-1.5 font-bold text-foreground">
									<IconFilter class="size-3.5 text-primary" />
									<span class="text-xs">Filter Pesanan</span>
								</div>
								{#if activeFiltersCount > 0}
									<button
										type="button"
										onclick={() => {
											orderStore.clearActiveFulfillmentFilters();
											orderStore.clearActivePaymentFilters();
											activeCurrentPage = 1;
										}}
										class="cursor-pointer text-[11px] font-semibold text-primary hover:underline"
									>
										Reset Filter
									</button>
								{/if}
							</div>

							<!-- 1. Status (Status Pesanan / fulfillmentStatus) -->
							<div class="flex flex-col gap-2">
								<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
									Status
								</span>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
									{#each fulfillmentFilterOptions as opt (opt.value)}
										<Checkbox
											size="sm"
											label={opt.label}
											checked={orderStore.activeFulfillmentFilters.includes(opt.value)}
											onchange={() => {
												orderStore.toggleActiveFulfillmentFilter(opt.value);
												activeCurrentPage = 1;
											}}
											classes={{
												label: 'text-xs font-medium text-foreground cursor-pointer select-none'
											}}
										/>
									{/each}
								</div>
							</div>

							<!-- 2. Pembayaran (Status Pembayaran / paymentStatus) -->
							<div class="flex flex-col gap-2 border-t border-border/70 pt-2.5">
								<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
									Pembayaran
								</span>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
									{#each paymentFilterOptions as opt (opt.value)}
										<Checkbox
											size="sm"
											label={opt.label}
											checked={orderStore.activePaymentFilters.includes(opt.value)}
											onchange={() => {
												orderStore.toggleActivePaymentFilter(opt.value);
												activeCurrentPage = 1;
											}}
											classes={{
												label: 'text-xs font-medium text-foreground cursor-pointer select-none'
											}}
										/>
									{/each}
								</div>
							</div>
						</div>
					</Popover>
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
							{#if orderStore.activeSearchQuery || orderStore.activeFulfillmentFilter !== 'ALL' || orderStore.activeFulfillmentFilters.length > 0 || orderStore.activeOrderTypeFilter !== 'ALL' || orderStore.activePaymentFilter !== 'ALL' || orderStore.activePaymentFilters.length > 0}
								<Button
									variant="outline"
									size="sm"
									onclick={() => {
										orderStore.resetActiveFilters();
										activeCurrentPage = 1;
									}}
									class="mt-2 rounded-md text-xs font-semibold"
								>
									Reset Pencarian & Filter
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
										No. Invoice
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
										Sisa Tagihan
									</TableHead>
									<TableHead class="h-9 px-4 text-center text-xs font-bold text-foreground-subtle">
										Status
									</TableHead>
									<TableHead class="h-9 px-4 text-center text-xs font-bold text-foreground-subtle">
										Pembayaran
									</TableHead>
									<TableHead class="h-9 px-4 text-center text-xs font-bold text-foreground-subtle">
										Aksi
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each paginatedActiveOrders as ord (ord.id)}
									<TableRow
										class="hover:bg-muted/30 border-b border-border/40 transition-colors duration-150"
									>
										<!-- 1. No. Invoice -->
										<TableCell class="px-4 py-3 align-top">
											<div class="flex flex-col gap-0.5">
												<button
													type="button"
													onclick={() => openDetail(ord)}
													class="cursor-pointer text-left font-bold text-primary transition-colors hover:underline"
												>
													{ord.invoiceNumber}
												</button>
												<span class="text-[11px] text-foreground-subtle">
													{formatOrderDateTime(ord.issuedAt)}
												</span>
											</div>
										</TableCell>

										<!-- 2. Pelanggan -->
										<TableCell class="px-4 py-3 align-top">
											<div class="flex flex-col gap-0.5">
												<span class="font-bold text-foreground">{ord.customerName}</span>
												{#if ord.customerType === 'reseller' || (ord.customerPhone && ord.customerPhone !== '-')}
													<div class="flex items-center gap-1.5">
														{#if ord.customerType === 'reseller'}
															<span
																class="py-0.2 rounded bg-indigo-500/10 px-1.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"
															>
																Reseller
															</span>
														{/if}
														{#if ord.customerPhone && ord.customerPhone !== '-'}
															<span class="text-[11px] text-foreground-subtle">
																{ord.customerPhone}
															</span>
														{/if}
													</div>
												{/if}
											</div>
										</TableCell>

										<!-- 3. Total Tagihan -->
										<TableCell class="px-4 py-3 text-right align-top font-bold text-foreground">
											{formatCurrency(ord.subtotal)}
										</TableCell>

										<!-- 4. Terbayar -->
										<TableCell
											class="px-4 py-3 text-right align-top font-bold text-emerald-600 dark:text-emerald-400"
										>
											{formatCurrency(ord.totalPaid)}
										</TableCell>

										<!-- 5. Sisa Tagihan -->
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

										<!-- 6. Status (Status Pesanan / Quick Change Popover) -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<Dropdown
													placement="bottom"
													offset={4}
													aria-label="Ubah Status Pesanan"
													class="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
													classes={{
														trigger:
															'inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
														content: 'min-w-52 border-border bg-app-surface p-1 shadow-lg'
													}}
													title="Klik untuk ubah status pengerjaan"
												>
													{#snippet trigger({ open })}
														{#if ord.fulfillmentStatus === 'CREATED'}
															<span
																class="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-500/40 dark:text-slate-300"
															>
																<IconFileText class="size-3 text-slate-500 dark:text-slate-400" />
																<span>Pesanan Dibuat</span>
																<IconChevronDown
																	class="size-2.5 text-slate-500/70 transition-transform {open
																		? 'rotate-180'
																		: ''}"
																/>
															</span>
														{:else if ord.fulfillmentStatus === 'QUEUED'}
															<span
																class="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500/40 dark:text-sky-300"
															>
																<IconClock class="size-3 text-sky-600 dark:text-sky-400" />
																<span>Antrean Produksi</span>
																<IconChevronDown
																	class="size-2.5 text-sky-500/70 transition-transform {open
																		? 'rotate-180'
																		: ''}"
																/>
															</span>
														{:else if ord.fulfillmentStatus === 'PROCESSING'}
															<span
																class="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 transition-colors hover:border-indigo-500/40 dark:text-indigo-300"
															>
																<IconPrinter class="size-3 text-indigo-600 dark:text-indigo-400" />
																<span>Di Proses</span>
																<IconChevronDown
																	class="size-2.5 text-indigo-500/70 transition-transform {open
																		? 'rotate-180'
																		: ''}"
																/>
															</span>
														{:else if ord.fulfillmentStatus === 'READY_FOR_PICKUP'}
															<span
																class="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 transition-colors hover:border-amber-500/40 dark:text-amber-300"
															>
																<IconPackage class="size-3 text-amber-600 dark:text-amber-400" />
																<span>Siap Diambil</span>
																<IconChevronDown
																	class="size-2.5 text-amber-500/70 transition-transform {open
																		? 'rotate-180'
																		: ''}"
																/>
															</span>
														{:else if ord.fulfillmentStatus === 'PICKED_UP'}
															<span
																class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 transition-colors hover:border-emerald-500/40 dark:text-emerald-300"
															>
																<IconCheckCircle2
																	class="size-3 text-emerald-600 dark:text-emerald-400"
																/>
																<span>Sudah Diambil</span>
																<IconChevronDown
																	class="size-2.5 text-emerald-500/70 transition-transform {open
																		? 'rotate-180'
																		: ''}"
																/>
															</span>
														{/if}
													{/snippet}

													<!-- Header Popover -->
													<div
														class="border-b border-border/70 px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
													>
														Ubah Status Pengerjaan
													</div>

													<!-- 1. Pesanan Dibuat -->
													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle {ord.fulfillmentStatus ===
														'CREATED'
															? 'bg-surface-subtle font-semibold'
															: ''}"
														onSelect={() => handleStatusChange(ord, 'CREATED')}
													>
														<IconFileText class="size-3.5 text-slate-500 dark:text-slate-400" />
														<span>Pesanan Dibuat</span>
														{#if ord.fulfillmentStatus === 'CREATED'}
															<IconCheck class="ml-auto size-3.5 text-primary" />
														{/if}
													</DropdownItem>

													<!-- 2. Antrean Produksi -->
													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle {ord.fulfillmentStatus ===
														'QUEUED'
															? 'bg-surface-subtle font-semibold'
															: ''}"
														onSelect={() => handleStatusChange(ord, 'QUEUED')}
													>
														<IconClock class="size-3.5 text-sky-600 dark:text-sky-400" />
														<span>Antrean Produksi</span>
														{#if ord.fulfillmentStatus === 'QUEUED'}
															<IconCheck class="ml-auto size-3.5 text-primary" />
														{/if}
													</DropdownItem>

													<!-- 3. Di Proses -->
													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle {ord.fulfillmentStatus ===
														'PROCESSING'
															? 'bg-surface-subtle font-semibold'
															: ''}"
														onSelect={() => handleStatusChange(ord, 'PROCESSING')}
													>
														<IconPrinter class="size-3.5 text-indigo-600 dark:text-indigo-400" />
														<span>Di Proses</span>
														{#if ord.fulfillmentStatus === 'PROCESSING'}
															<IconCheck class="ml-auto size-3.5 text-primary" />
														{/if}
													</DropdownItem>

													<!-- 4. Siap Diambil -->
													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle {ord.fulfillmentStatus ===
														'READY_FOR_PICKUP'
															? 'bg-surface-subtle font-semibold'
															: ''}"
														onSelect={() => handleStatusChange(ord, 'READY_FOR_PICKUP')}
													>
														<IconPackage class="size-3.5 text-amber-600 dark:text-amber-400" />
														<span>Siap Diambil</span>
														{#if ord.fulfillmentStatus === 'READY_FOR_PICKUP'}
															<IconCheck class="ml-auto size-3.5 text-primary" />
														{/if}
													</DropdownItem>

													<div class="my-1 border-t border-border/60"></div>

													<!-- 5. Sudah Diambil (Serah Terima) -->
													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle {ord.fulfillmentStatus ===
														'PICKED_UP'
															? 'bg-surface-subtle font-semibold'
															: ''}"
														onSelect={() => handleStatusChange(ord, 'PICKED_UP')}
													>
														<IconCheckCircle2
															class="size-3.5 text-emerald-600 dark:text-emerald-400"
														/>
														<span>Sudah Diambil</span>
														{#if ord.fulfillmentStatus === 'PICKED_UP'}
															<IconCheck class="ml-auto size-3.5 text-primary" />
														{:else if ord.remainingAmount > 0}
															<span
																class="py-0.2 ml-auto rounded bg-amber-500/10 px-1.5 text-[9px] font-semibold text-amber-700 dark:text-amber-300"
															>
																Piutang
															</span>
														{/if}
													</DropdownItem>
												</Dropdown>
											</div>
										</TableCell>

										<!-- 7. Pembayaran (Status Pembayaran) -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												{@render paymentChip(ord.status)}
											</div>
										</TableCell>

										<!-- 7. Aksi (Vertical Ellipsis Dropdown Popover) -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<Dropdown
													placement="bottom-end"
													offset={4}
													aria-label="Aksi Pesanan"
													class="size-8 justify-center! rounded-lg border border-transparent p-0! text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
													classes={{
														trigger: 'size-8 justify-center! p-0!',
														content: 'min-w-44 border-border bg-app-surface p-1 shadow-md'
													}}
												>
													{#snippet trigger()}
														<IconEllipsisVertical class="size-4" />
													{/snippet}

													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
														onSelect={() => openDetail(ord)}
													>
														<IconEye class="size-3.5 text-foreground-subtle" />
														<span>Lihat Rincian</span>
													</DropdownItem>

													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
														onSelect={() => openReceipt(ord)}
													>
														<IconPrinter class="size-3.5 text-foreground-subtle" />
														<span>Cetak Faktur / Struk</span>
													</DropdownItem>

													{#if ord.remainingAmount > 0 && ord.status !== 'CANCELLED'}
														<DropdownItem
															class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
															onSelect={() => openPayment(ord)}
														>
															<IconCreditCard
																class="size-3.5 text-emerald-600 dark:text-emerald-400"
															/>
															<span>Pelunasan Sisa</span>
														</DropdownItem>
													{/if}

													{#if ord.fulfillmentStatus === 'READY_FOR_PICKUP'}
														<div class="my-1 border-t border-border/60"></div>
														<DropdownItem
															class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
															onSelect={() => handlePickup(ord)}
														>
															<IconCheckCircle2
																class="size-3.5 text-emerald-600 dark:text-emerald-400"
															/>
															<span>Serah Terima Barang</span>
														</DropdownItem>
													{/if}

													{#if ord.status !== 'CANCELLED' && ord.fulfillmentStatus !== 'PICKED_UP'}
														<div class="my-1 border-t border-border/60"></div>
														<DropdownItem
															class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
															onSelect={() => openCancelModal(ord)}
														>
															<IconBan class="size-3.5 text-danger" />
															<span>Batalkan Pesanan</span>
														</DropdownItem>
													{/if}
												</Dropdown>
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
									<TableHead class="h-9 px-4 text-center text-xs font-bold text-foreground-subtle">
										Pembayaran
									</TableHead>
									<TableHead class="h-9 px-4 text-center text-xs font-bold text-foreground-subtle">
										Aksi
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each paginatedCompletedOrders as ord (ord.id)}
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
											<div class="flex flex-col gap-0.5">
												<span class="font-bold text-foreground">{ord.customerName}</span>
												{#if ord.customerType === 'reseller' || (ord.customerPhone && ord.customerPhone !== '-')}
													<div class="flex items-center gap-1.5">
														{#if ord.customerType === 'reseller'}
															<span
																class="py-0.2 rounded bg-indigo-500/10 px-1.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"
															>
																Reseller
															</span>
														{/if}
														{#if ord.customerPhone && ord.customerPhone !== '-'}
															<span class="text-[11px] text-foreground-subtle">
																{ord.customerPhone}
															</span>
														{/if}
													</div>
												{/if}
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
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												{@render paymentChip(ord.status)}
											</div>
										</TableCell>

										<!-- Aksi (Vertical Ellipsis Dropdown Popover) -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<Dropdown
													placement="bottom-end"
													offset={4}
													aria-label="Aksi Pesanan Selesai"
													class="size-8 justify-center! rounded-lg border border-transparent p-0! text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
													classes={{
														trigger: 'size-8 justify-center! p-0!',
														content: 'min-w-44 border-border bg-app-surface p-1 shadow-md'
													}}
												>
													{#snippet trigger()}
														<IconEllipsisVertical class="size-4" />
													{/snippet}

													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
														onSelect={() => openDetail(ord)}
													>
														<IconEye class="size-3.5 text-foreground-subtle" />
														<span>Lihat Rincian</span>
													</DropdownItem>

													<DropdownItem
														class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
														onSelect={() => openReceipt(ord)}
													>
														<IconPrinter class="size-3.5 text-foreground-subtle" />
														<span>Cetak Salinan Struk</span>
													</DropdownItem>

													{#if ord.remainingAmount > 0 && ord.status !== 'CANCELLED'}
														<DropdownItem
															class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
															onSelect={() => openPayment(ord)}
														>
															<IconCreditCard
																class="size-3.5 text-emerald-600 dark:text-emerald-400"
															/>
															<span>Pelunasan Piutang</span>
														</DropdownItem>
													{/if}
												</Dropdown>
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

<!-- Modal: Batalkan Pesanan -->
<OrderCancelDialog
	bind:isOpen={isCancelOpen}
	order={selectedOrderForCancel}
	onConfirm={handleCancelConfirm}
/>
