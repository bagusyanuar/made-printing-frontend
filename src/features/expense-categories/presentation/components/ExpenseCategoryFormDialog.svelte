<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { Radio } from 'dystopia-linear-lib/components/radio';
	import { Combobox, type ComboboxOption } from 'dystopia-linear-lib/components/combobox';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconReceipt from '~icons/lucide/receipt';
	import { productCategoryStore } from '$features/product-categories/application/product-category.store.svelte';
	import type {
		ExpenseCategory,
		ExpenseCategoryInput,
		ExpenseGroup
	} from '../../domain/expense-category.entity';
	import { generateExpenseCategoryCode } from '../../domain/expense-category.entity';
	import { expenseCategorySchema } from '../../domain/expense-category.schema';

	interface Props {
		open: boolean;
		category?: ExpenseCategory | null;
		defaultOrder?: number;
		onSave: (input: ExpenseCategoryInput) => Promise<boolean>;
		onClose: () => void;
	}

	let {
		open = $bindable(false),
		category = null,
		defaultOrder = 1,
		onSave,
		onClose
	}: Props = $props();

	let name = $state('');
	let group = $state<ExpenseGroup>('production');
	let productCategoryId = $state<string | undefined>(undefined);
	let displayOrder = $state(1);

	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);
	let fieldErrors = $state<Record<string, string>>({});

	onMount(() => {
		if (productCategoryStore.items.length === 0) {
			productCategoryStore.load();
		}
	});

	function modalSlideIn(node: Element, { duration = 260 } = {}) {
		return {
			duration,
			css: (t: number) => {
				const eased = 1 - Math.pow(1 - t, 4);
				const y = (1 - eased) * -36;
				const scale = 0.96 + 0.04 * eased;
				return `
					transform: translateY(${y}px) scale(${scale});
					opacity: ${eased};
				`;
			}
		};
	}

	$effect(() => {
		if (open) {
			if (productCategoryStore.items.length === 0) {
				productCategoryStore.load();
			}

			if (category) {
				name = category.name;
				group = category.group;
				productCategoryId = category.productCategoryId ?? undefined;
				displayOrder = category.displayOrder;
			} else {
				name = '';
				group = 'production';
				productCategoryId = undefined;
				displayOrder = defaultOrder;
			}
			formError = null;
			fieldErrors = {};
		}
	});

	const categoryOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return productCategoryStore.items.map((c) => ({
			value: c.id,
			label: c.name
		}));
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = null;
		fieldErrors = {};

		const trimmedName = name.trim();
		if (!trimmedName) {
			fieldErrors = { name: 'Nama kategori pengeluaran wajib diisi' };
			return;
		}

		const finalCode = category ? category.code : generateExpenseCategoryCode(trimmedName, group);

		const selectedProdCat =
			group === 'production' && productCategoryId
				? productCategoryStore.items.find((c) => c.id === productCategoryId)
				: null;

		const payload: ExpenseCategoryInput = {
			code: finalCode,
			name: trimmedName,
			group,
			productCategoryId: group === 'production' && productCategoryId ? productCategoryId : null,
			productCategoryName: selectedProdCat ? selectedProdCat.name : null,
			displayOrder: Number(displayOrder) || 1,
			isActive: category ? category.isActive : true
		};

		const validation = expenseCategorySchema.safeParse(payload);
		if (!validation.success) {
			const formatted = validation.error.format();
			fieldErrors = {
				name: formatted.name?._errors[0] ?? '',
				group: formatted.group?._errors[0] ?? '',
				productCategoryId: formatted.productCategoryId?._errors[0] ?? '',
				displayOrder: formatted.displayOrder?._errors[0] ?? ''
			};
			return;
		}

		isSubmitting = true;
		const success = await onSave(payload);
		isSubmitting = false;

		if (success) {
			onClose();
		} else {
			formError = 'Gagal menyimpan kategori pengeluaran. Silakan periksa kembali formulir.';
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="expense-cat-form-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup modal"
			tabindex="-1"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Modal Container -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 250 }}
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconReceipt class="size-4.5" />
					</div>
					<div>
						<Typography
							id="expense-cat-form-title"
							variant="h3"
							as="h2"
							class="text-base font-bold text-foreground sm:text-lg"
						>
							{category ? 'Edit Kategori Pengeluaran' : 'Tambah Kategori Pengeluaran Baru'}
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							{category
								? `Perbarui informasi kategori pos biaya "${category.name}"`
								: 'Tentukan nama pos biaya, kelompok pengeluaran, dan kategori produk terkait'}
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="flex size-8 items-center justify-center rounded-lg border border-transparent text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Modal Body -->
			<form id="expense-cat-form" onsubmit={handleSubmit} class="flex-1 overflow-y-auto p-5 sm:p-6">
				<div class="flex flex-col gap-4.5">
					{#if formError}
						<div
							class="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
						>
							<IconAlertCircle class="size-4 shrink-0" />
							<span>{formError}</span>
						</div>
					{/if}

					<!-- 1. Nama Kategori Pengeluaran (Required) -->
					<div class="flex flex-col gap-1.5">
						<label for="expense-name" class="text-xs font-semibold text-foreground">
							Nama Kategori Pengeluaran <span class="text-danger">*</span>
						</label>
						<TextField
							id="expense-name"
							size="sm"
							placeholder="Contoh: Pembelian Bahan Baku Flexy, Tagihan Listrik 3-Phase"
							value={name}
							onValueChange={(val) => {
								name = val;
								fieldErrors = { ...fieldErrors, name: '' };
							}}
							class={cn('w-full', fieldErrors.name && 'border-danger focus:border-danger')}
						/>
						{#if fieldErrors.name}
							<span class="text-[11px] text-danger">{fieldErrors.name}</span>
						{/if}
					</div>

					<!-- 2. Grup Pengeluaran (Radio Button Card Selector) -->
					<div role="group" aria-labelledby="expense-group-label" class="flex flex-col gap-1.5">
						<span id="expense-group-label" class="text-xs font-semibold text-foreground">
							Grup Pengeluaran <span class="text-danger">*</span>
						</span>
						<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
							<div
								role="presentation"
								class={cn(
									'cursor-pointer rounded-lg border p-3 transition-all',
									group === 'production'
										? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
										: 'border-border bg-surface-subtle/40 hover:border-border-hover hover:bg-surface-subtle'
								)}
								onclick={() => {
									if (!isSubmitting) {
										group = 'production';
										fieldErrors = { ...fieldErrors, group: '', productCategoryId: '' };
									}
								}}
							>
								<Radio
									id="group-production"
									name="expense-group"
									value="production"
									bind:group
									disabled={isSubmitting}
									label="Produksi"
									description="Bahan cetak, tinta solvent/UV, consumable, & mesin cetak."
									classes={{
										field: 'w-full cursor-pointer',
										label: 'font-medium text-foreground cursor-pointer text-xs',
										description: 'text-[11px] text-foreground-subtle cursor-pointer'
									}}
								/>
							</div>

							<div
								role="presentation"
								class={cn(
									'cursor-pointer rounded-lg border p-3 transition-all',
									group === 'operational'
										? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
										: 'border-border bg-surface-subtle/40 hover:border-border-hover hover:bg-surface-subtle'
								)}
								onclick={() => {
									if (!isSubmitting) {
										group = 'operational';
										productCategoryId = undefined;
										fieldErrors = { ...fieldErrors, group: '', productCategoryId: '' };
									}
								}}
							>
								<Radio
									id="group-operational"
									name="expense-group"
									value="operational"
									bind:group
									disabled={isSubmitting}
									label="Operasional"
									description="Beban umum, utilitas kantor/workshop, gaji, sewa, & konsumsi."
									classes={{
										field: 'w-full cursor-pointer',
										label: 'font-medium text-foreground cursor-pointer text-xs',
										description: 'text-[11px] text-foreground-subtle cursor-pointer'
									}}
								/>
							</div>
						</div>
						{#if fieldErrors.group}
							<span class="text-[11px] text-danger">{fieldErrors.group}</span>
						{/if}
					</div>

					<!-- 3. Kategori Produk Terkait (Wajib jika group === 'production') -->
					{#if group === 'production'}
						<div class="flex flex-col gap-1.5" transition:fade={{ duration: 150 }}>
							<label for="product-category" class="text-xs font-semibold text-foreground">
								Kategori Produk Terkait <span class="text-danger">*</span>
							</label>
							{#if categoryOptions.length > 0}
								<Combobox
									id="product-category"
									options={categoryOptions}
									bind:value={productCategoryId}
									size="md"
									clearable={false}
									labels={{
										placeholder: 'Pilih Kategori Produk Terkait',
										searchPlaceholder: 'Cari kategori produk...',
										empty: 'Tidak ada kategori ditemukan'
									}}
									classes={{ content: 'z-60' }}
									class={cn(
										'w-full',
										fieldErrors.productCategoryId && 'border-danger focus:border-danger'
									)}
								/>
							{:else}
								<div
									class="flex items-center rounded-lg border border-border bg-surface-subtle/60 p-2.5 text-xs text-foreground-subtle"
								>
									Memuat pilihan kategori produk...
								</div>
							{/if}
							<span class="text-[11px] text-foreground-subtle">
								Wajib dipilih untuk keperluan alokasi HPP dan rekapitulasi pengeluaran per jenis
								produk cetak.
							</span>
							{#if fieldErrors.productCategoryId}
								<span class="text-[11px] text-danger">{fieldErrors.productCategoryId}</span>
							{/if}
						</div>
					{/if}

					<!-- 4. Indexing Urutan Tampilan -->
					<div class="flex flex-col gap-1.5">
						<label for="expense-display-order" class="text-xs font-semibold text-foreground">
							Indexing Urutan Tampilan <span class="text-danger">*</span>
						</label>
						<TextField
							id="expense-display-order"
							type="number"
							size="sm"
							min="1"
							value={String(displayOrder)}
							onValueChange={(val) => {
								const num = parseInt(val, 10);
								if (!isNaN(num) && num >= 1) {
									displayOrder = num;
								}
								fieldErrors = { ...fieldErrors, displayOrder: '' };
							}}
							class={cn('w-full', fieldErrors.displayOrder && 'border-danger focus:border-danger')}
						/>
						<span class="text-[11px] text-foreground-subtle">
							Digunakan untuk menentukan urutan saat lookup di formulir transaksi pengeluaran.
						</span>
						{#if fieldErrors.displayOrder}
							<span class="text-[11px] text-danger">{fieldErrors.displayOrder}</span>
						{/if}
					</div>
				</div>
			</form>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 sm:px-6">
				<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
					Batal
				</Button>
				<Button
					type="submit"
					form="expense-cat-form"
					variant="default"
					size="sm"
					isLoading={isSubmitting}
				>
					{category ? 'Simpan Perubahan' : 'Tambah Kategori'}
				</Button>
			</div>
		</div>
	</div>
{/if}
