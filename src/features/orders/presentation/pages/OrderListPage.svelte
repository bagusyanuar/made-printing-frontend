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
	import { DatePicker } from 'dystopia-linear-lib/components/date-picker';
	import type { CalendarRangeValue } from 'dystopia-linear-lib/components/calendar';
	import { getLocalTimeZone, today } from '@internationalized/date';

	import IconReceipt from '~icons/lucide/receipt';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import IconSearch from '~icons/lucide/search';
	import IconRefreshCw from '~icons/lucide/refresh-cw';
	import IconEye from '~icons/lucide/eye';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconPrinter from '~icons/lucide/printer';
	import IconLayers from '~icons/lucide/layers';
	import IconPackage from '~icons/lucide/package';
	import IconX from '~icons/lucide/x';
	import IconClock from '~icons/lucide/clock';
	import IconBan from '~icons/lucide/ban';
	import IconFileText from '~icons/lucide/file-text';
	import IconFilter from '~icons/lucide/filter';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconCheck from '~icons/lucide/check';

	import type {
		Order,
		OrderPaymentStatus,
		OrderFulfillmentStatus,
		OrderType
	} from '../../domain/order.entity';
	import { formatCurrency, formatOrderDateTime } from '../../domain/order.entity';
	import { orderStore } from '../../application/order.store.svelte';

	import OrderDetailDialog from '../components/OrderDetailDialog.svelte';
	import OrderPaymentDialog from '../components/OrderPaymentDialog.svelte';
	import OrderReceiptDialog from '../components/OrderReceiptDialog.svelte';
	import OrderCancelDialog from '../components/OrderCancelDialog.svelte';
	import OrderCancellationInfoDialog from '../components/OrderCancellationInfoDialog.svelte';
	import OrderStatusChip from '../components/OrderStatusChip.svelte';
	import OrderPaymentChip from '../components/OrderPaymentChip.svelte';

	// Dialog states
	let isDetailOpen = $state(false);
	let selectedOrderForDetail = $state<Order | null>(null);

	let isPaymentOpen = $state(false);
	let selectedOrderForPayment = $state<Order | null>(null);

	let isReceiptOpen = $state(false);
	let selectedOrderForReceipt = $state<Order | null>(null);

	let isCancelOpen = $state(false);
	let selectedOrderForCancel = $state<Order | null>(null);

	let isCancellationInfoOpen = $state(false);
	let selectedOrderForCancellationInfo = $state<Order | null>(null);

	// Pagination states
	let activeCurrentPage = $state(1);
	let activePageSize = $state(10);

	function getTodayRangeValue(): CalendarRangeValue {
		const currentToday = today(getLocalTimeZone());
		return { start: currentToday, end: currentToday };
	}

	let completedCurrentPage = $state(1);
	let completedPageSize = $state(10);
	let completedDatePickerValue = $state<CalendarRangeValue | undefined>(getTodayRangeValue());

	function handleCompletedDateRangeChange(range: CalendarRangeValue) {
		completedDatePickerValue = range;
		orderStore.setCompletedDateRange(
			range.start ? range.start.toString() : null,
			range.end ? range.end.toString() : null
		);
		completedCurrentPage = 1;
	}

	function resetAllCompletedFilters() {
		orderStore.resetCompletedFilters();
		completedDatePickerValue = undefined;
		completedCurrentPage = 1;
	}

	const paginatedActiveOrders = $derived.by(() => {
		const start = (activeCurrentPage - 1) * activePageSize;
		return orderStore.filteredActiveOrders.slice(start, start + activePageSize);
	});

	const paginatedCompletedOrders = $derived.by(() => {
		const start = (completedCurrentPage - 1) * completedPageSize;
		return orderStore.filteredCompletedOrders.slice(start, start + completedPageSize);
	});

	let isFilterPopoverOpen = $state(false);
	let isCompletedFilterPopoverOpen = $state(false);

	const activeFiltersCount = $derived(
		orderStore.activeFulfillmentFilters.length + orderStore.activePaymentFilters.length
	);

	const completedFiltersCount = $derived(
		orderStore.completedStatusFilters.length +
			orderStore.completedPaymentFilters.length +
			orderStore.completedOrderTypeFilters.length
	);

	const completedStatusFilterOptions: { value: 'PICKED_UP' | 'CANCELLED'; label: string }[] = [
		{ value: 'PICKED_UP', label: 'Sudah Diambil' },
		{ value: 'CANCELLED', label: 'Dibatalkan' }
	];

	const completedOrderTypeFilterOptions: { value: OrderType; label: string }[] = [
		{ value: 'PRODUCTION', label: 'Produksi' },
		{ value: 'RETAIL', label: 'Ritel' }
	];

	const completedPaymentFilterOptions: { value: OrderPaymentStatus; label: string }[] = [
		{ value: 'LUNAS', label: 'Lunas' },
		{ value: 'PARTIAL_PAID', label: 'Bayar Sebagian' },
		{ value: 'UNPAID', label: 'Belum DiBayar' },
		{ value: 'CANCELLED', label: 'Dibatalkan' },
		{ value: 'REFUND', label: 'Refund' }
	];

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

	function openCancellationInfo(ord: Order) {
		selectedOrderForCancellationInfo = ord;
		isCancellationInfoOpen = true;
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
	</div>

	<!-- KPI Order Process Monitoring Widgets (4 Aesthetic SaaS Cards) -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Card 1: Pesanan Aktif -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
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
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
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

		<!-- Card 2: Antrean Produksi -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
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
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400"
					>
						<IconClock class="size-4.5" />
					</div>
				</div>
				<div
					class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
				>
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-sky-500"></span>
						Menunggu Produksi
					</span>
					<span
						class="py-0.2 rounded bg-sky-500/10 px-1.5 font-bold text-sky-600 dark:text-sky-400"
					>
						Antrean
					</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 3: Di Proses -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Di Proses
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span class="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
								{orderStore.processingCount}
							</span>
							<span class="text-xs font-semibold text-foreground-subtle"> Pesanan </span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
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

		<!-- Card 4: Siap Diambil -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
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
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
					>
						<IconPackage class="size-4.5" />
					</div>
				</div>
				<div
					class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
				>
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-amber-500"></span>
						Siap Ambil
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
													class="inline-flex h-auto! cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0! leading-none transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
													classes={{
														trigger:
															'inline-flex h-auto! cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0! leading-none transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
														content: 'min-w-52 border-border bg-app-surface p-1 shadow-lg'
													}}
													title="Klik untuk ubah status pengerjaan"
												>
													{#snippet trigger({ open })}
														<OrderStatusChip
															fulfillmentStatus={ord.fulfillmentStatus}
															showChevron={true}
															{open}
														/>
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
												<OrderPaymentChip status={ord.status} />
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
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<!-- Search Input on Left -->
				<div class="relative w-full sm:w-72">
					<TextField
						size="sm"
						placeholder="Cari invoice selesai, nama pelanggan..."
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

				<!-- Actions on Right: Date Range Filter & Refresh -->
				<div class="flex items-center gap-2 self-end sm:self-auto">
					<DatePicker
						type="range"
						bind:value={completedDatePickerValue}
						onValueChange={handleCompletedDateRangeChange}
						clearable={true}
						locale="id-ID"
						labels={{
							placeholder: 'Filter rentang tanggal',
							clear: 'Hapus filter tanggal',
							previousMonth: 'Bulan sebelumnya',
							nextMonth: 'Bulan berikutnya',
							previousYear: 'Tahun sebelumnya',
							nextYear: 'Tahun berikutnya',
							previousYears: 'Beberapa tahun sebelumnya',
							nextYears: 'Beberapa tahun berikutnya'
						}}
						class="w-fit max-w-full"
						classes={{
							trigger: `h-8 w-auto rounded-md bg-app-surface pl-2.5 text-xs ${completedDatePickerValue?.start ? 'pr-8' : 'pr-2.5'}`,
							icon: 'size-3.5',
							value: 'flex-initial text-xs',
							clearButton: 'right-1.5 size-5',
							content: 'bg-app-surface shadow-lg'
						}}
					/>
					<Button
						variant="outline"
						size="sm"
						onclick={() => orderStore.refresh()}
						disabled={orderStore.isLoading}
						aria-label="Segarkan data nota selesai"
						title="Segarkan data nota selesai"
						class="size-8 justify-center! p-0!"
					>
						<IconRefreshCw
							class="size-4 text-foreground-subtle transition-transform {orderStore.isLoading
								? 'animate-spin'
								: ''}"
						/>
					</Button>

					<!-- Filter Button with Popover (Nota Selesai) -->
					<Popover
						bind:open={isCompletedFilterPopoverOpen}
						placement="bottom-end"
						offset={8}
						class="h-8! gap-1.5 rounded-md px-2.5! text-xs! font-semibold transition-colors {completedFiltersCount >
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
							{#if completedFiltersCount > 0}
								<span
									class="inline-flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
								>
									{completedFiltersCount}
								</span>
							{/if}
						{/snippet}

						<div class="flex flex-col gap-3">
							<!-- Header Popover -->
							<div class="flex items-center justify-between border-b border-border/70 pb-2">
								<div class="flex items-center gap-1.5 font-bold text-foreground">
									<IconFilter class="size-3.5 text-primary" />
									<span class="text-xs">Filter Nota Selesai</span>
								</div>
								{#if completedFiltersCount > 0}
									<button
										type="button"
										onclick={() => {
											orderStore.clearCompletedStatusFilters();
											orderStore.clearCompletedPaymentFilters();
											orderStore.clearCompletedOrderTypeFilters();
											completedCurrentPage = 1;
										}}
										class="cursor-pointer text-[11px] font-semibold text-primary hover:underline"
									>
										Reset Filter
									</button>
								{/if}
							</div>

							<!-- 1. Tipe Nota (Produksi vs Ritel) -->
							<div class="flex flex-col gap-2">
								<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
									Tipe Nota
								</span>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
									{#each completedOrderTypeFilterOptions as opt (opt.value)}
										<Checkbox
											size="sm"
											label={opt.label}
											checked={orderStore.completedOrderTypeFilters.includes(opt.value)}
											onchange={() => {
												orderStore.toggleCompletedOrderTypeFilter(opt.value);
												completedCurrentPage = 1;
											}}
											classes={{
												label: 'text-xs font-medium text-foreground cursor-pointer select-none'
											}}
										/>
									{/each}
								</div>
							</div>

							<!-- 2. Status (Sudah Diambil vs Dibatalkan) -->
							<div class="flex flex-col gap-2 border-t border-border/70 pt-2.5">
								<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
									Status
								</span>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
									{#each completedStatusFilterOptions as opt (opt.value)}
										<Checkbox
											size="sm"
											label={opt.label}
											checked={orderStore.completedStatusFilters.includes(opt.value)}
											onchange={() => {
												orderStore.toggleCompletedStatusFilter(opt.value);
												completedCurrentPage = 1;
											}}
											classes={{
												label: 'text-xs font-medium text-foreground cursor-pointer select-none'
											}}
										/>
									{/each}
								</div>
							</div>

							<!-- 2. Pembayaran -->
							<div class="flex flex-col gap-2 border-t border-border/70 pt-2.5">
								<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
									Pembayaran
								</span>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
									{#each completedPaymentFilterOptions as opt (opt.value)}
										<Checkbox
											size="sm"
											label={opt.label}
											checked={orderStore.completedPaymentFilters.includes(opt.value)}
											onchange={() => {
												orderStore.toggleCompletedPaymentFilter(opt.value);
												completedCurrentPage = 1;
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
							{#if orderStore.completedSearchQuery || orderStore.completedStatusFilter !== 'ALL' || orderStore.completedStatusFilters.length > 0 || orderStore.completedOrderTypeFilter !== 'ALL' || orderStore.completedOrderTypeFilters.length > 0 || orderStore.completedPaymentFilter !== 'ALL' || orderStore.completedPaymentFilters.length > 0 || orderStore.completedDateRange.startDate || orderStore.completedDateRange.endDate}
								<Button
									variant="outline"
									size="sm"
									onclick={resetAllCompletedFilters}
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
								{#each paginatedCompletedOrders as ord (ord.id)}
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
												<div class="flex items-center gap-1.5">
													{#if ord.orderType === 'PRODUCTION'}
														<span
															class="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-300"
														>
															Produksi
														</span>
													{:else}
														<span
															class="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300"
														>
															Ritel
														</span>
													{/if}
													<span class="text-[11px] text-foreground-subtle">
														{formatOrderDateTime(ord.pickedUpAt || ord.cancelledAt || ord.issuedAt)}
													</span>
												</div>
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

										<!-- 6. Status (Sudah Diambil vs Dibatalkan) -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<OrderStatusChip
													fulfillmentStatus={ord.fulfillmentStatus}
													paymentStatus={ord.status}
													pickedUpBy={ord.pickedUpBy}
													onCancelClick={() => openCancellationInfo(ord)}
												/>
											</div>
										</TableCell>

										<!-- 7. Pembayaran -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<OrderPaymentChip status={ord.status} />
											</div>
										</TableCell>

										<!-- 8. Aksi (Vertical Ellipsis Dropdown Popover) -->
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

													{#if ord.remainingAmount > 0 && ord.status !== 'CANCELLED' && ord.status !== 'REFUND'}
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

<!-- Modal: Detail & Alasan Pembatalan -->
<OrderCancellationInfoDialog
	open={isCancellationInfoOpen}
	order={selectedOrderForCancellationInfo}
	onClose={() => {
		isCancellationInfoOpen = false;
		selectedOrderForCancellationInfo = null;
	}}
	onOpenDetail={(ord) => openDetail(ord)}
/>
