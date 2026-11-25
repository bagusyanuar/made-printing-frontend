<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import { Combobox, type ComboboxOption } from 'dystopia-linear-lib/components/combobox';
	import { EmptyState } from 'dystopia-linear-lib/components/empty-state';
	import { DatePicker } from 'dystopia-linear-lib/components/date-picker';
	import { Switch } from 'dystopia-linear-lib/components/switch';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconWallet from '~icons/lucide/wallet';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconCirclePlus from '~icons/lucide/circle-plus';
	import IconCheck from '~icons/lucide/check';
	import IconEdit2 from '~icons/lucide/edit-2';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconLayers from '~icons/lucide/layers';
	import IconWrench from '~icons/lucide/wrench';
	import IconLandmark from '~icons/lucide/landmark';
	import IconBanknote from '~icons/lucide/banknote';
	import IconInfo from '~icons/lucide/info';
	import IconCircleCheck from '~icons/lucide/circle-check';
	import IconCircleAlert from '~icons/lucide/circle-alert';
	import { expenseCategoryStore } from '$features/expense-categories/application/expense-category.store.svelte';
	import { supplierStore } from '$features/suppliers/application/supplier.store.svelte';
	import {
		EXPENSE_ACCOUNTS,
		formatCurrency,
		type ExpenseAccountName,
		type ExpenseGroup,
		type ExpenseInput,
		type ExpenseItemInput,
		type ExpensePaymentLine
	} from '../../domain/expense.entity';
	import { createExpenseSchema, expenseItemSchema } from '../../domain/expense.schema';

	interface Props {
		open: boolean;
		onSave: (input: ExpenseInput) => Promise<boolean>;
		onClose: () => void;
	}

	interface CartItem extends ExpenseItemInput {
		localId: string;
	}

	type VendorInputMode = 'supplier' | 'manual';

	let { open = $bindable(false), onSave, onClose }: Props = $props();

	function createDefaultSplitAmounts(): Record<ExpenseAccountName, number | undefined> {
		return {
			'Kas Kecil': undefined,
			'Kas Besar': undefined,
			Transfer: undefined
		};
	}

	// Left Panel: Item Builder States
	let categoryId = $state<string | undefined>(undefined);
	let itemDescription = $state('');
	let itemAmount = $state<number | undefined>(undefined);
	let itemNotes = $state('');
	let editingLocalId = $state<string | null>(null);
	let itemErrors = $state<Record<string, string>>({});

	// Right Panel: Receipt Header States
	let expenseDateValue = $state<CalendarDate | undefined>(today(getLocalTimeZone()));
	let referenceNumber = $state('-');
	let vendorMode = $state<VendorInputMode>('supplier');
	let selectedSupplierId = $state<string | undefined>(undefined);
	let manualVendorName = $state('');
	let receiptNotes = $state('');

	// Right Panel: Cart & Discount States
	let cartItems = $state<CartItem[]>([]);
	let discountAmount = $state<number | undefined>(undefined);

	// Right Panel: Funding Source & Paid Amount States (below cart)
	let isSplitPayment = $state(false);
	let selectedAccount = $state<ExpenseAccountName>('Kas Kecil');
	let singlePaidAmount = $state<number | null | undefined>(null); // null => auto full grandTotal
	let splitAmounts = $state<Record<ExpenseAccountName, number | undefined>>(
		createDefaultSplitAmounts()
	);

	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);

	onMount(() => {
		if (expenseCategoryStore.items.length === 0) {
			expenseCategoryStore.load();
		}
		if (supplierStore.items.length === 0) {
			supplierStore.load();
		}
	});

	$effect(() => {
		if (open) {
			if (expenseCategoryStore.items.length === 0) {
				expenseCategoryStore.load();
			}
			if (supplierStore.items.length === 0) {
				supplierStore.load();
			}
			resetItemForm();
			expenseDateValue = today(getLocalTimeZone());
			referenceNumber = '-';
			vendorMode = 'supplier';
			selectedSupplierId = undefined;
			manualVendorName = '';
			receiptNotes = '';
			cartItems = [];
			discountAmount = undefined;
			isSplitPayment = false;
			selectedAccount = 'Kas Kecil';
			singlePaidAmount = null;
			splitAmounts = createDefaultSplitAmounts();
			formError = null;
			isSubmitting = false;
		}
	});

	function resetItemForm() {
		categoryId = undefined;
		itemDescription = '';
		itemAmount = undefined;
		itemNotes = '';
		editingLocalId = null;
		itemErrors = {};
	}

	const categoryOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return expenseCategoryStore.items
			.filter((c) => c.isActive)
			.map((c) => ({
				value: c.id,
				label: `${c.name} (${c.group === 'production' ? 'Produksi' : 'Operasional'})`
			}));
	});

	const supplierOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return supplierStore.items
			.filter((s) => s.isActive)
			.sort((a, b) => a.displayOrder - b.displayOrder)
			.map((s) => ({
				value: s.id,
				label: s.contactPerson ? `${s.name} — ${s.contactPerson}` : s.name
			}));
	});

	const selectedCategory = $derived.by(() => {
		if (!categoryId) return null;
		return expenseCategoryStore.items.find((c) => c.id === categoryId) ?? null;
	});

	const selectedSupplier = $derived.by(() => {
		if (!selectedSupplierId) return null;
		return supplierStore.items.find((s) => s.id === selectedSupplierId) ?? null;
	});

	const cartSubtotal = $derived(cartItems.reduce((sum, item) => sum + item.amount, 0));

	const effectiveDiscount = $derived(Math.max(0, discountAmount ?? 0));

	const isDiscountValid = $derived(effectiveDiscount <= cartSubtotal);

	const grandTotal = $derived(Math.max(0, cartSubtotal - effectiveDiscount));

	const productionItemCount = $derived(
		cartItems.filter((item) => item.group === 'production').length
	);

	const operationalItemCount = $derived(
		cartItems.filter((item) => item.group === 'operational').length
	);

	const splitTotalAllocated = $derived(
		EXPENSE_ACCOUNTS.reduce((sum, acc) => sum + (splitAmounts[acc] || 0), 0)
	);

	const totalPaidAmount = $derived.by(() => {
		if (grandTotal <= 0) return 0;
		if (!isSplitPayment) {
			if (singlePaidAmount === null) return grandTotal;
			if (singlePaidAmount === undefined) return 0;
			return Math.max(0, singlePaidAmount);
		}
		return Math.max(0, splitTotalAllocated);
	});

	const isOverPaid = $derived(totalPaidAmount > grandTotal);

	const remainingPayable = $derived(Math.max(0, grandTotal - totalPaidAmount));

	const activePaymentLines = $derived.by<ExpensePaymentLine[]>(() => {
		if (grandTotal <= 0 || totalPaidAmount <= 0) return [];
		if (!isSplitPayment) {
			return [{ accountName: selectedAccount, amount: totalPaidAmount }];
		}
		return EXPENSE_ACCOUNTS.filter((acc) => (splitAmounts[acc] || 0) > 0).map((acc) => ({
			accountName: acc,
			amount: splitAmounts[acc] ?? 0
		}));
	});

	const isFullPaidSelected = $derived(grandTotal > 0 && totalPaidAmount === grandTotal);

	const isTempoSelected = $derived(grandTotal > 0 && totalPaidAmount < grandTotal);

	const canSubmit = $derived(
		cartItems.length > 0 && grandTotal > 0 && isDiscountValid && !isOverPaid
	);

	function getAccountVisual(account: ExpenseAccountName) {
		switch (account) {
			case 'Kas Kecil':
				return {
					icon: IconWallet,
					activeClass:
						'border-amber-500/50 bg-amber-500/10 font-bold text-amber-700 shadow-2xs dark:text-amber-300',
					iconClass: 'text-amber-600 dark:text-amber-400'
				};
			case 'Kas Besar':
				return {
					icon: IconBanknote,
					activeClass:
						'border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 shadow-2xs dark:text-emerald-300',
					iconClass: 'text-emerald-600 dark:text-emerald-400'
				};
			case 'Transfer':
				return {
					icon: IconLandmark,
					activeClass:
						'border-sky-500/50 bg-sky-500/10 font-bold text-sky-700 shadow-2xs dark:text-sky-300',
					iconClass: 'text-sky-600 dark:text-sky-400'
				};
		}
	}

	function modalSlideIn(node: Element, { duration = 220 } = {}) {
		return {
			duration,
			css: (t: number) => {
				const eased = 1 - Math.pow(1 - t, 3);
				const y = (1 - eased) * 16;
				const scale = 0.97 + 0.03 * eased;
				return `transform: translateY(${y}px) scale(${scale}); opacity: ${eased};`;
			}
		};
	}

	function handleAddOrUpdateItem(e: SubmitEvent) {
		e.preventDefault();
		itemErrors = {};
		formError = null;

		const chosenGroup: ExpenseGroup = selectedCategory?.group ?? 'operational';
		const candidate: ExpenseItemInput = {
			group: chosenGroup,
			categoryId: categoryId ?? '',
			categoryName: selectedCategory?.name ?? '',
			productCategoryName: selectedCategory?.productCategoryName ?? null,
			description: itemDescription.trim(),
			amount: itemAmount ?? 0,
			notes: itemNotes.trim() || null
		};

		const validation = expenseItemSchema.safeParse(candidate);
		if (!validation.success) {
			const formatted = validation.error.format();
			itemErrors = {
				categoryId: formatted.categoryId?._errors[0] ?? '',
				description: formatted.description?._errors[0] ?? '',
				amount: formatted.amount?._errors[0] ?? ''
			};
			return;
		}

		if (editingLocalId) {
			cartItems = cartItems.map((item) =>
				item.localId === editingLocalId ? { ...validation.data, localId: editingLocalId } : item
			);
		} else {
			cartItems = [
				...cartItems,
				{
					...validation.data,
					localId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
				}
			];
		}

		resetItemForm();
	}

	function handleEditCartItem(item: CartItem) {
		categoryId = item.categoryId;
		itemDescription = item.description;
		itemAmount = item.amount;
		itemNotes = item.notes ?? '';
		editingLocalId = item.localId;
		itemErrors = {};
	}

	function handleRemoveCartItem(localId: string) {
		cartItems = cartItems.filter((item) => item.localId !== localId);
		if (editingLocalId === localId) {
			resetItemForm();
		}
	}

	function handleSplitToggle(checked: boolean) {
		isSplitPayment = checked;
		splitAmounts = createDefaultSplitAmounts();
		if (checked) {
			const initialAlloc = Math.min(grandTotal, totalPaidAmount);
			if (initialAlloc > 0) {
				splitAmounts[selectedAccount] = initialAlloc;
			}
		} else {
			singlePaidAmount = null;
		}
	}

	function fillRemainingToAccount(account: ExpenseAccountName) {
		if (remainingPayable <= 0) return;
		splitAmounts = {
			...splitAmounts,
			[account]: (splitAmounts[account] || 0) + remainingPayable
		};
	}

	function buildIsoExpenseDate(dateVal: CalendarDate | undefined): string {
		if (!dateVal) return new Date().toISOString();
		const now = new Date();
		const combined = new Date(
			dateVal.year,
			dateVal.month - 1,
			dateVal.day,
			now.getHours(),
			now.getMinutes(),
			now.getSeconds()
		);
		return combined.toISOString();
	}

	async function handleSubmitReceipt() {
		formError = null;
		if (cartItems.length === 0) {
			formError = 'Tambahkan minimal 1 item pengeluaran ke keranjang terlebih dahulu.';
			return;
		}

		if (!isDiscountValid) {
			formError = 'Potongan / diskon tidak boleh melebihi subtotal item.';
			return;
		}

		if (isOverPaid) {
			formError = `Nominal pembayaran melebihi total akhir nota sebesar ${formatCurrency(totalPaidAmount - grandTotal)}.`;
			return;
		}

		const resolvedVendorId = vendorMode === 'supplier' ? (selectedSupplier?.id ?? null) : null;
		const resolvedVendorName =
			vendorMode === 'supplier'
				? (selectedSupplier?.name ?? null)
				: manualVendorName.trim() || null;

		const payload: ExpenseInput = {
			expenseDate: buildIsoExpenseDate(expenseDateValue),
			items: cartItems.map((item) => ({
				group: item.group,
				categoryId: item.categoryId,
				categoryName: item.categoryName,
				productCategoryName: item.productCategoryName ?? null,
				description: item.description,
				amount: item.amount,
				notes: item.notes ?? null
			})),
			discountAmount: effectiveDiscount,
			vendorId: resolvedVendorId,
			vendorName: resolvedVendorName,
			paymentLines: activePaymentLines,
			status: 'APPROVED',
			referenceNumber: referenceNumber.trim() || '-',
			notes: receiptNotes.trim() || null
		};

		const validation = createExpenseSchema.safeParse(payload);
		if (!validation.success) {
			formError =
				validation.error.issues[0]?.message ??
				'Periksa kembali kelengkapan info nota dan alokasi pembayaran.';
			return;
		}

		isSubmitting = true;
		const success = await onSave(validation.data);
		isSubmitting = false;

		if (success) {
			onClose();
		} else {
			formError = 'Gagal menyimpan nota pengeluaran. Silakan coba lagi.';
		}
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (open && e.key === 'Escape' && !isSubmitting) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="expense-form-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-overlay backdrop-blur-xs transition-opacity"
			onclick={() => !isSubmitting && onClose()}
			aria-label="Tutup modal"
			tabindex="-1"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Split-Panel Modal Container -->
		<div
			class="relative z-10 flex h-[92vh] max-h-196 w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Modal Header -->
			<div class="flex shrink-0 items-center justify-between border-b border-border/50 px-6 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconWallet class="size-4.5" />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<Typography
								id="expense-form-title"
								variant="h4"
								as="h2"
								class="text-sm font-bold text-foreground sm:text-base"
							>
								Catat Pengeluaran Baru
							</Typography>
							<span
								class="inline-flex items-center rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
							>
								Multi-Item Nota
							</span>
						</div>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							Rakit pos biaya ke keranjang, atur potongan nota, dan catat pembayaran lunas atau
							hutang usaha.
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={() => !isSubmitting && onClose()}
					class="focus-visible:ring-focus-ring cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-surface-subtle hover:text-foreground focus-visible:ring-2 focus-visible:outline-hidden"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Two-Panel Split Body -->
			<div
				class="grid min-h-0 flex-1 grid-cols-1 divide-y divide-border/50 overflow-hidden md:grid-cols-12 md:divide-x md:divide-y-0"
			>
				<!-- LEFT PANEL: Item Builder Form (5 cols) -->
				<div class="flex min-h-0 flex-col bg-surface-subtle/20 md:col-span-5">
					<div
						class="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3"
					>
						<Typography variant="h4" as="h3" class="text-xs font-bold text-foreground">
							{editingLocalId ? 'Ubah Item Keranjang' : 'Tambah Item Pengeluaran'}
						</Typography>
						{#if selectedCategory}
							<span
								class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold {selectedCategory.group ===
								'production'
									? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
									: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'}"
							>
								{#if selectedCategory.group === 'production'}
									<IconLayers class="size-3" />
									<span>Produksi</span>
								{:else}
									<IconWrench class="size-3" />
									<span>Operasional</span>
								{/if}
							</span>
						{/if}
					</div>

					<form
						id="expense-item-builder-form"
						onsubmit={handleAddOrUpdateItem}
						class="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
					>
						<div class="flex flex-col gap-4">
							<!-- 1. Kategori Pos Biaya -->
							<div class="flex flex-col gap-1.5">
								<label for="expense-item-category" class="text-xs font-semibold text-foreground">
									Kategori Pos Biaya <span class="text-danger">*</span>
								</label>
								<Combobox
									id="expense-item-category"
									options={categoryOptions}
									bind:value={categoryId}
									size="sm"
									clearable={false}
									labels={{
										placeholder: 'Pilih kategori pos biaya...',
										searchPlaceholder: 'Cari kategori pengeluaran...',
										empty: 'Kategori tidak ditemukan'
									}}
									classes={{ content: 'z-60' }}
									class={cn('w-full bg-app-surface', itemErrors.categoryId && 'border-danger')}
								/>
								{#if selectedCategory?.productCategoryName}
									<span class="text-[11px] text-foreground-subtle">
										Terkait lini produk: <strong class="font-medium text-foreground">
											{selectedCategory.productCategoryName}
										</strong>
									</span>
								{/if}
								{#if itemErrors.categoryId}
									<span class="text-[11px] text-danger">{itemErrors.categoryId}</span>
								{/if}
							</div>

							<!-- 2. Keterangan Item -->
							<div class="flex flex-col gap-1.5">
								<label for="expense-item-desc" class="text-xs font-semibold text-foreground">
									Keterangan Item <span class="text-danger">*</span>
								</label>
								<TextField
									id="expense-item-desc"
									size="sm"
									placeholder="Contoh: 2 Roll Flexy Korea 440g / Listrik Workshop"
									value={itemDescription}
									onValueChange={(val) => {
										itemDescription = val;
										itemErrors = { ...itemErrors, description: '' };
									}}
									class={cn('w-full bg-app-surface', itemErrors.description && 'border-danger')}
								/>
								{#if itemErrors.description}
									<span class="text-[11px] text-danger">{itemErrors.description}</span>
								{/if}
							</div>

							<!-- 3. Nominal Langsung (Right-aligned finance convention) -->
							<div class="flex flex-col gap-1.5">
								<label for="expense-item-amount" class="text-xs font-semibold text-foreground">
									Nominal Item (Rp) <span class="text-danger">*</span>
								</label>
								<NumberField
									id="expense-item-amount"
									size="sm"
									value={itemAmount}
									onValueChange={(val) => {
										itemAmount = val;
										itemErrors = { ...itemErrors, amount: '' };
									}}
									min={100}
									thousandSeparator={true}
									placeholder="0"
									classes={{ input: 'text-right font-bold tabular-nums' }}
									class={cn(
										'w-full bg-app-surface font-semibold',
										itemErrors.amount && 'border-danger'
									)}
								>
									{#snippet prefix()}
										<span class="text-xs font-bold text-foreground-subtle">Rp</span>
									{/snippet}
								</NumberField>
								{#if itemErrors.amount}
									<span class="text-[11px] text-danger">{itemErrors.amount}</span>
								{/if}
							</div>

							<!-- 4. Catatan Item (Opsional) -->
							<div class="flex flex-col gap-1.5">
								<label for="expense-item-notes" class="text-xs font-semibold text-foreground">
									Catatan Item (Opsional)
								</label>
								<TextField
									id="expense-item-notes"
									size="sm"
									placeholder="Detail tambahan per item (mis. merek, ukuran, atau shift)"
									value={itemNotes}
									onValueChange={(val) => (itemNotes = val)}
									class="w-full bg-app-surface"
								/>
							</div>

							<!-- Item Builder Actions (Right-aligned directly below Catatan Item) -->
							<div class="flex items-center justify-end gap-2 pt-1">
								{#if editingLocalId}
									<Button type="button" variant="outline" size="sm" onclick={resetItemForm}>
										Batal Edit
									</Button>
									<Button type="submit" variant="default" size="sm" class="gap-1.5">
										<IconCheck class="size-3.5" />
										<span>Simpan Perubahan</span>
									</Button>
								{:else}
									<Button type="submit" variant="default" size="sm" class="gap-1.5">
										<IconCirclePlus class="size-4" />
										<span>Tambah</span>
									</Button>
								{/if}
							</div>
						</div>
					</form>
				</div>

				<!-- RIGHT PANEL: Info Nota -> Keranjang -> Diskon -> Sumber Dana & Nominal Bayar -> Submit (7 cols) -->
				<div class="flex min-h-0 flex-col bg-app-surface md:col-span-7">
					<!-- 1. Compact Receipt Header Info (Tanggal DatePicker, No. Nota, Vendor 2-Mode) -->
					<div
						class="shrink-0 space-y-2.5 border-b border-border/50 bg-surface-subtle/35 px-5 py-3.5"
					>
						<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
							<!-- Tanggal Nota using DatePicker -->
							<div class="flex flex-col gap-1">
								<span class="text-[11px] font-semibold text-foreground">
									Tanggal Nota <span class="text-danger">*</span>
								</span>
								<DatePicker
									type="single"
									bind:value={expenseDateValue}
									locale="id-ID"
									clearable={false}
									disabled={isSubmitting}
									labels={{
										placeholder: 'Pilih tanggal nota',
										previousMonth: 'Bulan sebelumnya',
										nextMonth: 'Bulan berikutnya',
										previousYear: 'Tahun sebelumnya',
										nextYear: 'Tahun berikutnya',
										previousYears: 'Beberapa tahun sebelumnya',
										nextYears: 'Beberapa tahun berikutnya'
									}}
									class="w-full"
									classes={{
										trigger: 'h-8 w-full justify-start rounded-md bg-app-surface px-2.5 text-xs',
										icon: 'size-3.5',
										value: 'text-xs',
										content: 'z-60 bg-app-surface shadow-lg'
									}}
								/>
							</div>

							<!-- No. Nota / Referensi -->
							<div class="flex flex-col gap-1">
								<label for="receipt-ref" class="text-[11px] font-semibold text-foreground">
									No. Nota / Referensi
								</label>
								<TextField
									id="receipt-ref"
									size="sm"
									placeholder="-"
									value={referenceNumber}
									onValueChange={(val) => (referenceNumber = val)}
									class="w-full bg-app-surface"
								/>
							</div>
						</div>

						<!-- Vendor / Supplier (2 Modes: Supplier vs Manual) -->
						<div class="flex flex-col gap-1">
							<div class="flex items-center justify-between gap-2">
								<span class="text-[11px] font-semibold text-foreground">
									Vendor / Toko / Penerima
								</span>
								<div
									class="inline-flex items-center gap-0.5 rounded-md border border-border bg-app-surface p-0.5"
									role="group"
									aria-label="Mode input vendor"
								>
									<button
										type="button"
										onclick={() => {
											vendorMode = 'supplier';
											manualVendorName = '';
										}}
										disabled={isSubmitting}
										class="cursor-pointer rounded px-2 py-0.5 text-[10px] font-semibold transition-colors {vendorMode ===
										'supplier'
											? 'bg-primary text-primary-foreground'
											: 'text-foreground-subtle hover:text-foreground'}"
									>
										Supplier
									</button>
									<button
										type="button"
										onclick={() => {
											vendorMode = 'manual';
											selectedSupplierId = undefined;
										}}
										disabled={isSubmitting}
										class="cursor-pointer rounded px-2 py-0.5 text-[10px] font-semibold transition-colors {vendorMode ===
										'manual'
											? 'bg-primary text-primary-foreground'
											: 'text-foreground-subtle hover:text-foreground'}"
									>
										Manual
									</button>
								</div>
							</div>

							{#if vendorMode === 'supplier'}
								<Combobox
									id="receipt-supplier"
									options={supplierOptions}
									bind:value={selectedSupplierId}
									size="sm"
									clearable={true}
									disabled={isSubmitting}
									labels={{
										placeholder: 'Pilih dari master data supplier...',
										searchPlaceholder: 'Cari nama supplier atau PIC...',
										empty: 'Supplier tidak ditemukan'
									}}
									classes={{ content: 'z-60' }}
									class="w-full bg-app-surface"
								/>
							{:else}
								<TextField
									id="receipt-vendor-manual"
									size="sm"
									placeholder="Ketik nama toko / vendor / teknisi secara manual..."
									value={manualVendorName}
									onValueChange={(val) => (manualVendorName = val)}
									disabled={isSubmitting}
									class="w-full bg-app-surface"
								/>
							{/if}
						</div>
					</div>

					<!-- 2. Scrollable Cart -> Discount -> Sumber Dana & Nominal Bayar -->
					<div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
						{#if formError}
							<div
								class="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger"
							>
								<IconAlertCircle class="size-4 shrink-0" />
								<span>{formError}</span>
							</div>
						{/if}

						<!-- A. Keranjang Item Nota -->
						<div class="space-y-2.5">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<IconShoppingBag class="size-3.5 text-primary" />
									<span class="text-xs font-bold text-foreground">Keranjang Item Nota</span>
									<span
										class="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
									>
										{cartItems.length} item
									</span>
								</div>
								{#if cartItems.length > 0}
									<button
										type="button"
										onclick={() => {
											cartItems = [];
											discountAmount = undefined;
											resetItemForm();
										}}
										disabled={isSubmitting}
										class="cursor-pointer text-[11px] font-semibold text-danger hover:underline disabled:opacity-50"
									>
										Kosongkan
									</button>
								{/if}
							</div>

							{#if cartItems.length === 0}
								<div class="rounded-lg border border-border/70 bg-surface-subtle/25 py-5">
									<EmptyState>
										{#snippet icon()}
											<div
												class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
											>
												<IconShoppingBag class="size-5" />
											</div>
										{/snippet}
										{#snippet title()}
											<Typography
												variant="h4"
												as="span"
												class="text-xs font-semibold text-foreground"
											>
												Keranjang Nota Masih Kosong
											</Typography>
										{/snippet}
										{#snippet description()}
											<Typography
												variant="muted"
												as="span"
												class="text-[11px] text-foreground-subtle"
											>
												Tambahkan satu atau beberapa item pengeluaran dari panel kiri (boleh campur
												Produksi & Operasional).
											</Typography>
										{/snippet}
									</EmptyState>
								</div>
							{:else}
								<div class="space-y-2">
									{#each cartItems as item, index (item.localId)}
										<div
											class={cn(
												'rounded-lg border p-2.5 transition-colors',
												editingLocalId === item.localId
													? 'border-primary/60 bg-primary/5'
													: 'border-border bg-app-surface hover:bg-surface-subtle/40'
											)}
										>
											<div class="flex items-start justify-between gap-2">
												<div class="min-w-0 flex-1">
													<div class="flex flex-wrap items-center gap-1.5">
														<span class="text-[10px] font-semibold text-foreground-subtle">
															#{index + 1}
														</span>
														<span
															class="rounded px-1.5 py-0.5 text-[9px] font-bold {item.group ===
															'production'
																? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
																: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'}"
														>
															{item.group === 'production' ? 'Produksi' : 'Operasional'}
														</span>
														<span class="truncate text-[11px] font-semibold text-foreground-subtle">
															{item.categoryName}
														</span>
													</div>
													<p class="mt-1 text-xs font-semibold text-foreground">
														{item.description}
													</p>
													{#if item.notes}
														<p class="mt-0.5 text-[11px] text-foreground-subtle">
															{item.notes}
														</p>
													{/if}
												</div>

												<div class="flex shrink-0 items-center gap-2">
													<span class="text-xs font-bold text-rose-600 dark:text-rose-400">
														{formatCurrency(item.amount)}
													</span>
													<div class="flex items-center gap-0.5">
														<button
															type="button"
															onclick={() => handleEditCartItem(item)}
															disabled={isSubmitting}
															title="Ubah item"
															aria-label="Ubah item"
															class="cursor-pointer rounded p-1 text-foreground-subtle transition-colors hover:bg-surface-subtle hover:text-foreground disabled:opacity-50"
														>
															<IconEdit2 class="size-3.5" />
														</button>
														<button
															type="button"
															onclick={() => handleRemoveCartItem(item.localId)}
															disabled={isSubmitting}
															title="Hapus item"
															aria-label="Hapus item"
															class="cursor-pointer rounded p-1 text-foreground-subtle transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
														>
															<IconTrash2 class="size-3.5" />
														</button>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>

								<TextField
									size="sm"
									placeholder="Catatan nota keseluruhan (opsional)..."
									value={receiptNotes}
									onValueChange={(val) => (receiptNotes = val)}
									class="w-full bg-surface-subtle/35 text-xs"
								/>
							{/if}
						</div>

						<!-- B. Ringkasan & Potongan Global Nota -->
						{#if cartItems.length > 0}
							<div
								class="space-y-2 rounded-lg border border-border/70 bg-surface-subtle/30 p-3 text-xs"
							>
								<div class="flex items-center justify-between">
									<span class="text-foreground-subtle">
										Subtotal Keranjang ({cartItems.length} item)
									</span>
									<span class="font-semibold text-foreground">{formatCurrency(cartSubtotal)}</span>
								</div>

								<div class="flex items-center justify-between gap-3">
									<label for="receipt-discount" class="text-foreground-subtle">
										Potongan / Diskon
									</label>
									<NumberField
										id="receipt-discount"
										size="sm"
										value={discountAmount}
										onValueChange={(val) => (discountAmount = val)}
										onfocus={(e) => {
											if (e.currentTarget.value === '0') e.currentTarget.select();
										}}
										min={0}
										max={cartSubtotal}
										thousandSeparator={true}
										placeholder="0"
										classes={{ input: 'text-right font-bold tabular-nums' }}
										class={cn('w-40 bg-app-surface font-bold', !isDiscountValid && 'border-danger')}
									>
										{#snippet prefix()}
											<span class="text-[10px] font-bold text-foreground-subtle">Rp</span>
										{/snippet}
									</NumberField>
								</div>

								{#if !isDiscountValid}
									<p class="text-right text-[11px] text-danger">
										Potongan tidak boleh melebihi subtotal keranjang.
									</p>
								{/if}

								<div
									class="flex items-center justify-between border-t border-border/50 pt-2 font-bold"
								>
									<span class="text-foreground">Total Akhir Nota</span>
									<span class="text-sm text-rose-600 dark:text-rose-400">
										{formatCurrency(grandTotal)}
									</span>
								</div>
							</div>
						{/if}

						<!-- C. Sumber Dana & Nominal Pembayaran (Below Cart, Kasir Concept) -->
						<div class="space-y-3 border-t border-border/50 pt-3.5">
							<!-- Split Sumber Dana Toggle Card -->
							<div
								class="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors {isSplitPayment
									? 'border-primary/50 bg-primary/8'
									: 'border-primary/30 bg-primary/3'}"
							>
								<div class="flex min-w-0 items-start gap-2.5">
									<div
										class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
									>
										<IconInfo class="size-3.5 text-primary" />
									</div>
									<label
										for="expense-split-payment-toggle"
										class="flex min-w-0 cursor-pointer flex-col gap-0.5 select-none"
									>
										<span class="text-xs font-bold tracking-wide text-primary">
											Split Sumber Dana
										</span>
										<span class="text-[11px] leading-snug text-foreground-subtle">
											Bayar nota ini menggunakan kombinasi Kas Kecil, Kas Besar, dan Transfer
											sekaligus.
										</span>
									</label>
								</div>

								<div class="shrink-0">
									<Switch
										id="expense-split-payment-toggle"
										checked={isSplitPayment}
										onCheckedChange={handleSplitToggle}
										disabled={isSubmitting}
									/>
								</div>
							</div>

							{#if !isSplitPayment}
								<!-- Single Funding Source + Nominal Pembayaran -->
								<div class="flex flex-col gap-2.5">
									<span
										class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
									>
										Sumber Dana
									</span>
									<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
										{#each EXPENSE_ACCOUNTS as account (account)}
											{@const visual = getAccountVisual(account)}
											{@const AccountIcon = visual.icon}
											{@const isSelected = selectedAccount === account}
											<button
												type="button"
												onclick={() => (selectedAccount = account)}
												disabled={isSubmitting}
												class="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-center transition-all {isSelected
													? visual.activeClass
													: 'hover:bg-muted/40 border-border/80 bg-app-surface text-foreground-subtle hover:border-border hover:text-foreground'}"
											>
												<AccountIcon class="size-4 shrink-0 {visual.iconClass}" />
												<span class="truncate text-xs font-semibold">{account}</span>
											</button>
										{/each}
									</div>

									<!-- Nominal Pembayaran (supports partial/tempo -> Hutang Usaha) -->
									<div class="mt-1 flex flex-col gap-2">
										<div class="flex items-center justify-between gap-2">
											<label
												for="expense-single-paid"
												class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
											>
												Pembayaran
											</label>
											<div class="flex items-center gap-1.5">
												<button
													type="button"
													onclick={() => (singlePaidAmount = null)}
													disabled={isSubmitting || grandTotal <= 0}
													class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-all disabled:opacity-50 {isFullPaidSelected
														? 'border-primary/50 bg-primary/10 text-primary'
														: 'border-border bg-app-surface text-foreground-subtle hover:text-foreground'}"
												>
													Bayar Lunas
												</button>
												<button
													type="button"
													onclick={() => (singlePaidAmount = 0)}
													disabled={isSubmitting || grandTotal <= 0}
													class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-all disabled:opacity-50 {isTempoSelected
														? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
														: 'border-border bg-app-surface text-foreground-subtle hover:text-foreground'}"
												>
													Tempo
												</button>
											</div>
										</div>

										<NumberField
											id="expense-single-paid"
											size="sm"
											thousandSeparator
											value={singlePaidAmount === null ? grandTotal : singlePaidAmount}
											onValueChange={(val) => {
												singlePaidAmount = val;
											}}
											onfocus={(e) => {
												if (e.currentTarget.value === '0') e.currentTarget.select();
											}}
											min={0}
											max={grandTotal}
											placeholder="0"
											classes={{ input: 'text-right font-bold tabular-nums' }}
											class={cn('w-full bg-app-surface font-bold', isOverPaid && 'border-danger')}
										>
											{#snippet prefix()}
												<span class="text-xs font-bold text-foreground-subtle">Rp</span>
											{/snippet}
										</NumberField>
									</div>
								</div>
							{:else}
								<!-- Split Payment Multi-Account Allocation Rows -->
								<div class="flex flex-col gap-2">
									<span
										class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
									>
										Rincian Pembayaran Multi Sumber Dana
									</span>

									<div class="flex flex-col gap-2 text-xs">
										{#each EXPENSE_ACCOUNTS as account (account)}
											{@const visual = getAccountVisual(account)}
											{@const AccountIcon = visual.icon}
											<div
												class="flex items-center justify-between gap-2 rounded-md border border-border/70 bg-surface-subtle/20 p-2"
											>
												<div class="flex min-w-0 items-center gap-2 font-medium text-foreground">
													<AccountIcon class="size-4 shrink-0 {visual.iconClass}" />
													<span class="truncate">{account}</span>
												</div>

												<div class="flex shrink-0 items-center gap-1.5">
													{#if remainingPayable > 0 && grandTotal > 0}
														<button
															type="button"
															onclick={() => fillRemainingToAccount(account)}
															disabled={isSubmitting}
															title="Isi sisa pembayaran ke akun ini"
															class="cursor-pointer rounded border border-border bg-app-surface px-1.5 py-1 text-[10px] font-semibold text-foreground-subtle transition-colors hover:border-primary/40 hover:text-primary"
														>
															Sisa
														</button>
													{/if}
													<NumberField
														size="sm"
														thousandSeparator
														value={splitAmounts[account]}
														onValueChange={(val) => {
															splitAmounts = { ...splitAmounts, [account]: val };
														}}
														onfocus={(e) => {
															if (e.currentTarget.value === '0') e.currentTarget.select();
														}}
														placeholder="0"
														classes={{ input: 'text-right font-bold tabular-nums' }}
														class="w-36 bg-app-surface font-bold"
													>
														{#snippet prefix()}
															<span class="text-[10px] font-bold text-foreground-subtle">Rp</span>
														{/snippet}
													</NumberField>
												</div>
											</div>
										{/each}
									</div>

									<div
										class="flex items-center justify-between border-t border-border/40 pt-2 text-xs font-semibold"
									>
										<span class="text-foreground-subtle">Total Pembayaran:</span>
										<span class="font-bold text-foreground">
											{formatCurrency(totalPaidAmount)}
										</span>
									</div>
								</div>
							{/if}

							<!-- Live Payment / Accounts Payable (Hutang Usaha) Indicator -->
							{#if grandTotal > 0}
								{#if isOverPaid}
									<div
										class="flex items-center justify-between rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-800 dark:text-rose-300"
									>
										<div class="flex items-center gap-1.5">
											<IconCircleAlert class="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
											<span class="font-semibold">Melebihi Total Nota:</span>
										</div>
										<span class="font-bold">{formatCurrency(totalPaidAmount - grandTotal)}</span>
									</div>
								{:else if remainingPayable > 0}
									<div
										class="flex items-center justify-between rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300"
									>
										<div class="flex items-center gap-1.5">
											<IconCircleAlert class="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
											<span class="font-semibold">
												{totalPaidAmount > 0
													? 'Sisa Masuk Hutang Usaha:'
													: 'Tempo (Masuk Hutang Usaha):'}
											</span>
										</div>
										<span class="font-bold">{formatCurrency(remainingPayable)}</span>
									</div>
								{:else}
									<div
										class="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300"
									>
										<div class="flex items-center gap-1.5">
											<IconCircleCheck
												class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
											/>
											<span class="font-semibold">Status: Lunas Penuh</span>
										</div>
										<span class="font-bold">{formatCurrency(grandTotal)}</span>
									</div>
								{/if}
							{/if}
						</div>
					</div>

					<!-- 3. Bottom Sticky Summary & Submit -->
					<div
						class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-surface-subtle/30 px-5 py-3.5"
					>
						<div class="flex flex-col">
							<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
								Total Nota ({cartItems.length} Item)
							</span>
							<div class="flex items-baseline gap-2">
								<span class="text-lg font-bold tracking-tight text-rose-600 dark:text-rose-400">
									{formatCurrency(grandTotal)}
								</span>
								{#if cartItems.length > 0}
									<span class="text-[11px] text-foreground-subtle">
										{[
											productionItemCount > 0 ? `${productionItemCount} Produksi` : null,
											operationalItemCount > 0 ? `${operationalItemCount} Operasional` : null,
											effectiveDiscount > 0 ? `Diskon ${formatCurrency(effectiveDiscount)}` : null
										]
											.filter(Boolean)
											.join(' • ')}
									</span>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={onClose}
								disabled={isSubmitting}
							>
								Batal
							</Button>
							<Button
								type="button"
								variant="default"
								size="sm"
								onclick={handleSubmitReceipt}
								disabled={!canSubmit}
								isLoading={isSubmitting}
								class="gap-1.5"
							>
								<IconCircleCheck class="size-3.5" />
								<span>Simpan</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
