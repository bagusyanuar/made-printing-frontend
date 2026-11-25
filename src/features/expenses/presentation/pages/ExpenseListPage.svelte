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

	import IconWallet from '~icons/lucide/wallet';
	import IconCirclePlus from '~icons/lucide/circle-plus';
	import IconLayers from '~icons/lucide/layers';
	import IconWrench from '~icons/lucide/wrench';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconSearch from '~icons/lucide/search';
	import IconRefreshCw from '~icons/lucide/refresh-cw';
	import IconFilter from '~icons/lucide/filter';
	import IconX from '~icons/lucide/x';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconEye from '~icons/lucide/eye';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconBan from '~icons/lucide/ban';

	import {
		EXPENSE_ACCOUNTS,
		formatCurrency,
		formatExpenseDateTime,
		type Expense,
		type ExpenseInput,
		type ExpensePaymentStatus,
		type ExpenseStatus
	} from '../../domain/expense.entity';
	import { expenseStore, type ExpenseMainTab } from '../../application/expense.store.svelte';
	import ExpenseStatusChip from '../components/ExpenseStatusChip.svelte';
	import ExpensePaymentChip from '../components/ExpensePaymentChip.svelte';
	import ExpenseDetailDialog from '../components/ExpenseDetailDialog.svelte';
	import ExpenseFormDialog from '../components/ExpenseFormDialog.svelte';
	import ExpensePaymentDialog from '../components/ExpensePaymentDialog.svelte';
	import ExpenseCancelDialog from '../components/ExpenseCancelDialog.svelte';

	// Dialog states
	let isDetailOpen = $state(false);
	let selectedExpenseForDetail = $state<Expense | null>(null);

	let isFormOpen = $state(false);

	let isPaymentOpen = $state(false);
	let selectedExpenseForPayment = $state<Expense | null>(null);

	let isCancelOpen = $state(false);
	let selectedExpenseForCancel = $state<Expense | null>(null);

	// Pagination & Filter states
	let currentPage = $state(1);
	let pageSize = $state(10);
	let datePickerValue = $state<CalendarRangeValue | undefined>(undefined);
	let isFilterPopoverOpen = $state(false);

	const paginatedExpenses = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return expenseStore.filteredExpenses.slice(start, start + pageSize);
	});

	const activeFiltersCount = $derived(
		expenseStore.statusFilters.length +
			expenseStore.paymentStatusFilters.length +
			expenseStore.accountFilters.length
	);

	const hasAnyFilter = $derived(
		Boolean(
			expenseStore.searchQuery.trim() ||
			expenseStore.statusFilters.length > 0 ||
			expenseStore.paymentStatusFilters.length > 0 ||
			expenseStore.accountFilters.length > 0 ||
			expenseStore.dateRange.startDate ||
			expenseStore.dateRange.endDate
		)
	);

	const statusFilterOptions: { value: ExpenseStatus; label: string }[] = [
		{ value: 'APPROVED', label: 'Disetujui' },
		{ value: 'PENDING', label: 'Menunggu' },
		{ value: 'CANCELLED', label: 'Dibatalkan' }
	];

	const paymentFilterOptions: { value: ExpensePaymentStatus; label: string }[] = [
		{ value: 'LUNAS', label: 'Lunas' },
		{ value: 'PARTIAL_PAID', label: 'Bayar Sebagian' },
		{ value: 'UNPAID', label: 'Hutang' }
	];

	onMount(() => {
		expenseStore.load();
	});

	function handleTabChange(tab: string) {
		expenseStore.setMainTab(tab as ExpenseMainTab);
		currentPage = 1;
	}

	function handleDateRangeChange(range: CalendarRangeValue) {
		datePickerValue = range;
		expenseStore.setDateRange(
			range.start ? range.start.toString() : null,
			range.end ? range.end.toString() : null
		);
		currentPage = 1;
	}

	function resetAllFilters() {
		expenseStore.resetFilters();
		datePickerValue = undefined;
		currentPage = 1;
	}

	function openDetail(expense: Expense) {
		selectedExpenseForDetail = expense;
		isDetailOpen = true;
	}

	function openCreateModal() {
		isFormOpen = true;
	}

	function openPaymentModal(expense: Expense) {
		selectedExpenseForPayment = expense;
		isPaymentOpen = true;
	}

	function openCancelModal(expense: Expense) {
		selectedExpenseForCancel = expense;
		isCancelOpen = true;
	}

	async function handleCreateExpense(input: ExpenseInput): Promise<boolean> {
		const subtotal = input.items.reduce((sum, item) => sum + item.amount, 0);
		const total = Math.max(0, subtotal - (input.discountAmount ?? 0));
		const paid = input.paymentLines.reduce((sum, line) => sum + line.amount, 0);
		const payable = Math.max(0, total - paid);

		const success = await expenseStore.create(input);
		if (success) {
			currentPage = 1;
			if (payable > 0) {
				toast.info('Pengeluaran Dicatat (Masuk Hutang Usaha)', {
					description: `Nota senilai ${formatCurrency(total)} disimpan dengan sisa hutang ${formatCurrency(payable)}.`
				});
			} else {
				toast.success('Pengeluaran Berhasil Dicatat', {
					description: `Nota dengan ${input.items.length} item sebesar ${formatCurrency(total)} telah disimpan.`
				});
			}
			return true;
		}
		toast.danger('Gagal Mencatat Pengeluaran', {
			description: expenseStore.error || 'Terjadi kesalahan sistem saat menyimpan pengeluaran.'
		});
		return false;
	}

	async function handleApproveExpense(expense: Expense) {
		const success = await expenseStore.approve(expense.id);
		if (success) {
			toast.success('Pengeluaran Disetujui', {
				description: `Transaksi ${expense.code} telah disetujui dan masuk rekap kas.`
			});
		} else {
			toast.danger('Gagal Menyetujui Pengeluaran', {
				description: expenseStore.error || 'Terjadi kesalahan sistem.'
			});
		}
	}

	async function handleCancelConfirm(reason: string): Promise<boolean> {
		if (!selectedExpenseForCancel) return false;
		const code = selectedExpenseForCancel.code;
		const success = await expenseStore.cancel(selectedExpenseForCancel.id, reason);
		if (success) {
			toast.success('Pengeluaran Dibatalkan', {
				description: `Transaksi ${code} berhasil dibatalkan.`
			});
			return true;
		}
		toast.danger('Gagal Membatalkan Pengeluaran', {
			description: expenseStore.error || 'Terjadi kesalahan sistem saat membatalkan pengeluaran.'
		});
		return false;
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-start gap-3.5 sm:gap-4">
			<div
				class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
			>
				<IconWallet class="size-6" />
			</div>
			<div class="flex flex-col">
				<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
					Pengeluaran
				</Typography>
				<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
					Pencatatan dan monitoring pengeluaran kas, belanja bahan baku cetak, listrik, perawatan
					mesin, serta hutang usaha supplier.
				</Typography>
			</div>
		</div>

		<Button
			variant="default"
			size="sm"
			onclick={openCreateModal}
			class="shrink-0 gap-1.5 self-start sm:self-auto"
		>
			<IconCirclePlus class="size-4" />
			<span>Catat Pengeluaran</span>
		</Button>
	</div>

	<!-- KPI Expense Monitoring Widgets (4 Aesthetic SaaS Cards) -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Card 1: Total Pengeluaran -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Total Pengeluaran
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span class="text-xl font-bold tracking-tight text-foreground xl:text-2xl">
								{formatCurrency(expenseStore.totalApprovedAmount)}
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
					>
						<IconWallet class="size-4.5" />
					</div>
				</div>
				<div
					class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
				>
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-rose-500"></span>
						{expenseStore.nonCancelledExpenses.length} Nota Aktif
					</span>
					<span
						class="py-0.2 rounded bg-rose-500/10 px-1.5 font-bold text-rose-600 dark:text-rose-400"
					>
						Bulan Ini
					</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 2: Bahan Baku & Produksi -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Bahan Baku & Tinta
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span
								class="text-xl font-bold tracking-tight text-sky-600 xl:text-2xl dark:text-sky-400"
							>
								{formatCurrency(expenseStore.productionTotalAmount)}
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400"
					>
						<IconLayers class="size-4.5" />
					</div>
				</div>
				<div
					class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
				>
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-sky-500"></span>
						Roll Flexy, Plano, Tinta
					</span>
					<span
						class="py-0.2 rounded bg-sky-500/10 px-1.5 font-bold text-sky-600 dark:text-sky-400"
					>
						Produksi
					</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 3: Operasional Workshop -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Operasional & Mesin
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span
								class="text-xl font-bold tracking-tight text-indigo-600 xl:text-2xl dark:text-indigo-400"
							>
								{formatCurrency(expenseStore.operationalTotalAmount)}
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
					>
						<IconWrench class="size-4.5" />
					</div>
				</div>
				<div
					class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
				>
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-indigo-500"></span>
						Listrik, Gaji, Service
					</span>
					<span
						class="py-0.2 rounded bg-indigo-500/10 px-1.5 font-bold text-indigo-600 dark:text-indigo-400"
					>
						Operasional
					</span>
				</div>
			</CardContent>
		</Card>

		<!-- Card 4: Hutang Usaha -->
		<Card
			class="relative overflow-hidden rounded-xl border border-border/80 bg-app-surface shadow-none"
		>
			<CardContent class="p-4 sm:p-4.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex flex-col">
						<span class="text-[11px] font-semibold tracking-wider text-foreground-subtle uppercase">
							Hutang Usaha
						</span>
						<div class="mt-1 flex items-baseline gap-1.5">
							<span
								class="text-xl font-bold tracking-tight text-amber-600 xl:text-2xl dark:text-amber-400"
							>
								{formatCurrency(expenseStore.totalPayableAmount)}
							</span>
						</div>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
					>
						<IconCreditCard class="size-4.5" />
					</div>
				</div>
				<div
					class="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]"
				>
					<span class="inline-flex items-center gap-1.5 text-foreground-subtle">
						<span class="size-1.5 rounded-full bg-amber-500"></span>
						Tagihan Supplier
					</span>
					{#if expenseStore.payableCount > 0}
						<span
							class="py-0.2 rounded bg-amber-500/15 px-1.5 font-bold text-amber-700 dark:text-amber-300"
						>
							{expenseStore.payableCount} Belum Lunas
						</span>
					{:else}
						<span
							class="py-0.2 rounded bg-emerald-500/10 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400"
						>
							Lunas Semua
						</span>
					{/if}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Primary Pills Tabs: Semua vs Produksi vs Operasional -->
	<Tabs value={expenseStore.mainTab} onValueChange={handleTabChange} class="flex flex-col gap-3">
		<!-- Primary Pills Navigation Header -->
		<div
			class="flex flex-col gap-3 border-b border-border/70 pb-3 sm:flex-row sm:items-center sm:justify-between"
		>
			<TabsList
				variant="pill"
				class="inline-flex w-fit items-center gap-0.5 rounded-lg border border-border bg-app-surface p-0.5 shadow-none"
			>
				<TabsTrigger
					value="ALL"
					class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5! py-1! text-xs! font-semibold transition-colors data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=inactive]:text-foreground-subtle data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:text-foreground"
				>
					<IconWallet class="size-3.5 shrink-0" />
					<span>Semua</span>
					<span
						class="py-0.2 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors {expenseStore.mainTab ===
						'ALL'
							? 'bg-primary-foreground/20 text-primary-foreground'
							: 'bg-muted text-foreground-subtle'}"
					>
						{expenseStore.allCount}
					</span>
				</TabsTrigger>

				<TabsTrigger
					value="production"
					class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5! py-1! text-xs! font-semibold transition-colors data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=inactive]:text-foreground-subtle data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:text-foreground"
				>
					<IconLayers class="size-3.5 shrink-0" />
					<span>Produksi</span>
					<span
						class="py-0.2 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors {expenseStore.mainTab ===
						'production'
							? 'bg-primary-foreground/20 text-primary-foreground'
							: 'bg-muted text-foreground-subtle'}"
					>
						{expenseStore.productionCount}
					</span>
				</TabsTrigger>

				<TabsTrigger
					value="operational"
					class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5! py-1! text-xs! font-semibold transition-colors data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=inactive]:text-foreground-subtle data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:text-foreground"
				>
					<IconWrench class="size-3.5 shrink-0" />
					<span>Operasional</span>
					<span
						class="py-0.2 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors {expenseStore.mainTab ===
						'operational'
							? 'bg-primary-foreground/20 text-primary-foreground'
							: 'bg-muted text-foreground-subtle'}"
					>
						{expenseStore.operationalCount}
					</span>
				</TabsTrigger>
			</TabsList>

			<!-- Right Status Banner -->
			<div class="text-xs text-foreground-subtle">
				{#if expenseStore.mainTab === 'ALL'}
					<span class="inline-flex items-center gap-1.5">
						<span class="size-2 animate-pulse rounded-full bg-blue-500"></span>
						Seluruh catatan nota pengeluaran kas, bahan baku, dan beban operasional
					</span>
				{:else if expenseStore.mainTab === 'production'}
					<span class="inline-flex items-center gap-1.5">
						<span class="size-2 rounded-full bg-sky-500"></span>
						Nota yang memuat belanja bahan baku roll/lembaran, tinta, & consumable produksi
					</span>
				{:else}
					<span class="inline-flex items-center gap-1.5">
						<span class="size-2 rounded-full bg-indigo-500"></span>
						Nota yang memuat beban listrik 3-phase, perawatan mesin, gaji, & utilitas toko
					</span>
				{/if}
			</div>
		</div>

		<TabsContent value={expenseStore.mainTab} class="flex flex-col gap-3">
			<!-- Toolbar: Search + DatePicker + Refresh + Filter Popover -->
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<!-- Search Input on Left -->
				<div class="relative w-full sm:w-72">
					<TextField
						size="sm"
						placeholder="Cari kode, kategori, item, vendor..."
						value={expenseStore.searchQuery}
						onValueChange={(val) => {
							expenseStore.setSearch(val);
							currentPage = 1;
						}}
						class="w-full pl-8"
					/>
					<div
						class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground-subtle"
					>
						<IconSearch class="size-3.5" />
					</div>
					{#if expenseStore.searchQuery.trim()}
						<button
							type="button"
							onclick={() => {
								expenseStore.setSearch('');
								currentPage = 1;
							}}
							class="hover:bg-muted absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded p-0.5 text-foreground-subtle"
							aria-label="Bersihkan pencarian"
						>
							<IconX class="size-3" />
						</button>
					{/if}
				</div>

				<!-- Actions on Right: Date Range Filter, Refresh, & Filter Popover -->
				<div class="flex items-center gap-2 self-end sm:self-auto">
					<DatePicker
						type="range"
						bind:value={datePickerValue}
						onValueChange={handleDateRangeChange}
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
							trigger: `h-8 w-auto rounded-md bg-app-surface pl-2.5 text-xs ${datePickerValue?.start ? 'pr-8' : 'pr-2.5'}`,
							icon: 'size-3.5',
							value: 'flex-initial text-xs',
							clearButton: 'right-1.5 size-5',
							content: 'bg-app-surface shadow-lg'
						}}
					/>

					<Button
						variant="outline"
						size="sm"
						onclick={() => expenseStore.refresh()}
						disabled={expenseStore.isLoading}
						aria-label="Segarkan data pengeluaran"
						title="Segarkan data pengeluaran"
						class="size-8 justify-center! p-0!"
					>
						<IconRefreshCw
							class="size-4 text-foreground-subtle transition-transform {expenseStore.isLoading
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
						title="Filter sumber dana, pembayaran, dan status"
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
									<span class="text-xs">Filter Pengeluaran</span>
								</div>
								{#if activeFiltersCount > 0}
									<button
										type="button"
										onclick={() => {
											expenseStore.clearAccountFilters();
											expenseStore.clearPaymentStatusFilters();
											expenseStore.clearStatusFilters();
											currentPage = 1;
										}}
										class="cursor-pointer text-[11px] font-semibold text-primary hover:underline"
									>
										Reset Filter
									</button>
								{/if}
							</div>

							<!-- 1. Sumber Dana -->
							<div class="flex flex-col gap-2">
								<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
									Sumber Dana
								</span>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
									{#each EXPENSE_ACCOUNTS as acc (acc)}
										<Checkbox
											size="sm"
											label={acc}
											checked={expenseStore.accountFilters.includes(acc)}
											onchange={() => {
												expenseStore.toggleAccountFilter(acc);
												currentPage = 1;
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
									{#each paymentFilterOptions as opt (opt.value)}
										<Checkbox
											size="sm"
											label={opt.label}
											checked={expenseStore.paymentStatusFilters.includes(opt.value)}
											onchange={() => {
												expenseStore.togglePaymentStatusFilter(opt.value);
												currentPage = 1;
											}}
											classes={{
												label: 'text-xs font-medium text-foreground cursor-pointer select-none'
											}}
										/>
									{/each}
								</div>
							</div>

							<!-- 3. Status -->
							<div class="flex flex-col gap-2 border-t border-border/70 pt-2.5">
								<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
									Status Nota
								</span>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-2.5">
									{#each statusFilterOptions as opt (opt.value)}
										<Checkbox
											size="sm"
											label={opt.label}
											checked={expenseStore.statusFilters.includes(opt.value)}
											onchange={() => {
												expenseStore.toggleStatusFilter(opt.value);
												currentPage = 1;
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

			<!-- Table Card: Pengeluaran -->
			<Card class="overflow-hidden border border-border bg-app-surface shadow-none">
				{#if expenseStore.isLoading && expenseStore.expenses.length === 0}
					<div class="flex flex-col items-center justify-center py-16 text-center">
						<Spinner class="size-8 text-primary" />
						<Typography variant="small" as="span" class="mt-3 text-xs text-foreground-subtle">
							Memuat data pengeluaran...
						</Typography>
					</div>
				{:else if expenseStore.error}
					<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
						<IconAlertTriangle class="size-8" />
						<Typography variant="body" as="span" class="mt-2 text-sm font-semibold">
							Gagal memuat daftar pengeluaran
						</Typography>
						<Typography variant="small" as="span" class="mt-1 text-xs text-foreground-subtle">
							{expenseStore.error}
						</Typography>
						<Button
							variant="outline"
							size="sm"
							onclick={() => expenseStore.load()}
							class="mt-4 rounded-md text-xs font-semibold"
						>
							Coba Lagi
						</Button>
					</div>
				{:else if expenseStore.filteredExpenses.length === 0}
					<div class="py-12">
						<EmptyState>
							{#snippet icon()}
								<div
									class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
								>
									<IconWallet class="size-6" />
								</div>
							{/snippet}
							{#snippet title()}
								<Typography variant="h4" as="span" class="text-sm font-semibold text-foreground">
									Tidak Ada Data Pengeluaran
								</Typography>
							{/snippet}
							{#snippet description()}
								<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
									{expenseStore.searchQuery
										? `Tidak ada nota pengeluaran yang cocok dengan kata kunci "${expenseStore.searchQuery}".`
										: 'Belum ada nota pengeluaran yang sesuai dengan filter saat ini.'}
								</Typography>
							{/snippet}
							{#if hasAnyFilter}
								<Button
									variant="outline"
									size="sm"
									onclick={resetAllFilters}
									class="mt-2 rounded-md text-xs font-semibold"
								>
									Reset Pencarian & Filter
								</Button>
							{:else}
								<Button
									variant="default"
									size="sm"
									onclick={openCreateModal}
									class="mt-2 gap-1.5 rounded-md text-xs font-semibold"
								>
									<IconCirclePlus class="size-3.5" />
									<span>Catat Pengeluaran Pertama</span>
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
										No. Transaksi
									</TableHead>
									<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
										Kategori & Rincian
									</TableHead>
									<TableHead class="h-9 px-4 text-xs font-bold text-foreground-subtle">
										Sumber Dana
									</TableHead>
									<TableHead class="h-9 px-4 text-right text-xs font-bold text-foreground-subtle">
										Total Nota
									</TableHead>
									<TableHead class="h-9 px-4 text-right text-xs font-bold text-foreground-subtle">
										Terbayar
									</TableHead>
									<TableHead class="h-9 px-4 text-right text-xs font-bold text-foreground-subtle">
										Sisa Hutang
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
								{#each paginatedExpenses as exp (exp.id)}
									{@const primaryItem = exp.items[0]}
									{@const extraItemsCount = Math.max(0, exp.items.length - 1)}
									<TableRow
										class="hover:bg-muted/30 border-b border-border/40 transition-colors duration-150"
									>
										<!-- 1. No. Transaksi -->
										<TableCell class="px-4 py-3 align-top">
											<div class="flex flex-col gap-0.5">
												<button
													type="button"
													onclick={() => openDetail(exp)}
													class="cursor-pointer text-left font-bold text-primary transition-colors hover:underline"
												>
													{exp.code}
												</button>
												<div class="flex items-center gap-1.5">
													{#if exp.group === 'production'}
														<span
															class="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-300"
														>
															Produksi
														</span>
													{:else if exp.group === 'operational'}
														<span
															class="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-300"
														>
															Operasional
														</span>
													{:else}
														<span
															class="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300"
														>
															Campuran
														</span>
													{/if}
													<span class="text-[11px] text-foreground-subtle">
														{formatExpenseDateTime(exp.expenseDate)}
													</span>
												</div>
											</div>
										</TableCell>

										<!-- 2. Kategori & Rincian -->
										<TableCell class="max-w-xs px-4 py-3 align-top">
											<div class="flex flex-col gap-0.5">
												<div class="flex flex-wrap items-center gap-1.5">
													<span class="font-bold text-foreground">
														{primaryItem?.categoryName ?? '-'}
													</span>
													{#if extraItemsCount > 0}
														<button
															type="button"
															onclick={() => openDetail(exp)}
															class="cursor-pointer rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/20"
														>
															+{extraItemsCount} item
														</button>
													{/if}
												</div>
												<span class="text-xs font-medium text-foreground">
													{primaryItem?.description ?? '-'}
												</span>
												{#if exp.vendorName || (exp.referenceNumber && exp.referenceNumber !== '-')}
													<span class="text-[11px] text-foreground-subtle">
														{[
															exp.vendorName,
															exp.referenceNumber && exp.referenceNumber !== '-'
																? exp.referenceNumber
																: null
														]
															.filter(Boolean)
															.join(' • ')}
													</span>
												{/if}
											</div>
										</TableCell>

										<!-- 3. Sumber Dana -->
										<TableCell class="px-4 py-3 align-top">
											<div class="flex flex-col gap-0.5">
												{#if exp.paymentLines.length > 1}
													<span class="font-medium text-foreground">
														Split ({exp.paymentLines.length} Sumber)
													</span>
													<span class="text-[11px] text-foreground-subtle">
														{exp.paymentLines
															.map((l) => `${l.accountName} (${formatCurrency(l.amount)})`)
															.join(' • ')}
													</span>
												{:else}
													<span class="font-medium text-foreground">{exp.accountName}</span>
												{/if}
												<span class="text-[11px] text-foreground-subtle">
													Oleh: {exp.recordedBy}
												</span>
											</div>
										</TableCell>

										<!-- 4. Total Nota -->
										<TableCell class="px-4 py-3 text-right align-top whitespace-nowrap">
											<div class="flex flex-col items-end gap-0.5">
												<span
													class="font-bold {exp.status === 'CANCELLED'
														? 'text-foreground-subtle line-through'
														: 'text-foreground'}"
												>
													{formatCurrency(exp.amount)}
												</span>
												{#if exp.discountAmount > 0}
													<span class="text-[10px] text-emerald-600 dark:text-emerald-400">
														Diskon {formatCurrency(exp.discountAmount)}
													</span>
												{/if}
											</div>
										</TableCell>

										<!-- 5. Terbayar -->
										<TableCell
											class="px-4 py-3 text-right align-top font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400"
										>
											{formatCurrency(exp.totalPaid)}
										</TableCell>

										<!-- 6. Sisa Hutang -->
										<TableCell class="px-4 py-3 text-right align-top font-bold whitespace-nowrap">
											{#if exp.remainingAmount > 0}
												<span class="text-amber-600 dark:text-amber-400">
													{formatCurrency(exp.remainingAmount)}
												</span>
											{:else}
												<span class="text-foreground-subtle">-</span>
											{/if}
										</TableCell>

										<!-- 7. Status -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<ExpenseStatusChip
													status={exp.status}
													onCancelClick={() => openDetail(exp)}
												/>
											</div>
										</TableCell>

										<!-- 8. Pembayaran -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<ExpensePaymentChip status={exp.paymentStatus} />
											</div>
										</TableCell>

										<!-- 9. Aksi (Vertical Ellipsis Dropdown Popover) -->
										<TableCell class="px-4 py-3 text-center align-top">
											<div class="flex items-center justify-center">
												<Dropdown
													placement="bottom-end"
													offset={4}
													aria-label="Aksi Pengeluaran"
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
														onSelect={() => openDetail(exp)}
													>
														<IconEye class="size-3.5 text-foreground-subtle" />
														<span>Lihat Rincian</span>
													</DropdownItem>

													{#if exp.remainingAmount > 0 && exp.status !== 'CANCELLED'}
														<DropdownItem
															class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
															onSelect={() => openPaymentModal(exp)}
														>
															<IconCreditCard
																class="size-3.5 text-emerald-600 dark:text-emerald-400"
															/>
															<span>Pelunasan Hutang</span>
														</DropdownItem>
													{/if}

													{#if exp.status === 'PENDING'}
														<DropdownItem
															class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
															onSelect={() => handleApproveExpense(exp)}
														>
															<IconCheckCircle2
																class="size-3.5 text-emerald-600 dark:text-emerald-400"
															/>
															<span>Setujui Pengeluaran</span>
														</DropdownItem>
													{/if}

													{#if exp.status !== 'CANCELLED'}
														<div class="my-1 border-t border-border/60"></div>
														<DropdownItem
															class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
															onSelect={() => openCancelModal(exp)}
														>
															<IconBan class="size-3.5 text-danger" />
															<span>Batalkan Pengeluaran</span>
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

			{#if !expenseStore.isLoading && !expenseStore.error && expenseStore.filteredExpenses.length > 0}
				<TablePagination
					bind:currentPage
					bind:pageSize
					totalItems={expenseStore.filteredExpenses.length}
					pageSizeOptions={[5, 10, 20, 50]}
					itemLabel="nota pengeluaran"
				/>
			{/if}
		</TabsContent>
	</Tabs>
</div>

<!-- Modal: Rincian Pengeluaran -->
<ExpenseDetailDialog
	open={isDetailOpen}
	expense={selectedExpenseForDetail}
	onClose={() => {
		isDetailOpen = false;
		selectedExpenseForDetail = null;
	}}
	onOpenPayment={openPaymentModal}
	onApprove={handleApproveExpense}
	onCancel={openCancelModal}
/>

<!-- Modal: Catat Pengeluaran Baru (Split-Panel Multi-Item) -->
<ExpenseFormDialog
	bind:open={isFormOpen}
	onSave={handleCreateExpense}
	onClose={() => (isFormOpen = false)}
/>

<!-- Modal: Pelunasan Hutang Usaha -->
<ExpensePaymentDialog
	open={isPaymentOpen}
	expense={selectedExpenseForPayment}
	onClose={() => {
		isPaymentOpen = false;
		selectedExpenseForPayment = null;
	}}
/>

<!-- Modal: Batalkan Pengeluaran -->
<ExpenseCancelDialog
	bind:isOpen={isCancelOpen}
	expense={selectedExpenseForCancel}
	onConfirm={handleCancelConfirm}
/>
