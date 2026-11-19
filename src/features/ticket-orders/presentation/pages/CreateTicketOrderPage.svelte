<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Card } from 'dystopia-linear-lib/components/card';
	import { toast } from 'dystopia-linear-lib/components/toast';
	import { Combobox, type ComboboxOption } from 'dystopia-linear-lib/components/combobox';
	import { NumberField } from '$lib/components/number-field';

	import IconArrowLeft from '~icons/lucide/arrow-left';
	import IconPlus from '~icons/lucide/plus';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconEdit2 from '~icons/lucide/edit-2';
	import IconSave from '~icons/lucide/save';
	import IconSend from '~icons/lucide/send';
	import IconFileText from '~icons/lucide/file-text';
	import IconLayers from '~icons/lucide/layers';
	import IconUser from '~icons/lucide/user';
	import IconCheck from '~icons/lucide/check';
	import IconRotateCcw from '~icons/lucide/rotate-ccw';

	import { productCategoryStore } from '$features/product-categories/application/product-category.store.svelte';
	import { productStore } from '$features/products/application/product.store.svelte';
	import { resellerStore } from '$features/resellers/application/reseller.store.svelte';
	import { attributeVariantStore } from '$features/attribute-variants/application/attribute-variant.store.svelte';

	import type { TicketOrderItemInput } from '../../domain/ticket-order.entity';
	import { formatDimensionText } from '../../domain/ticket-order.entity';
	import { ticketOrderStore } from '../../application/ticket-order.store.svelte';

	onMount(() => {
		productCategoryStore.load();
		productStore.load();
		resellerStore.load();
		attributeVariantStore.load();
		ticketOrderStore.initCartFromStorage();
	});

	// Form Builder States (Left Column)
	let selectedCategoryId = $state('');
	let selectedProductId = $state('');
	let selectedVariantName = $state('');
	let uom = $state<'m2' | 'm_lari' | 'lembar' | 'pcs' | 'box'>('m2');
	let lengthM = $state<number | null>(3);
	let widthM = $state<number | null>(1);
	let quantity = $state<number | null>(1);
	let productionNotes = $state('Mata ayam 4 sudut');
	let designFileUrl = $state('');

	let editingItemIndex = $state<number | null>(null);
	let lastAppliedProductId = $state<string | null>(null);

	// Derived products filtered by selected category
	const availableProducts = $derived.by(() => {
		if (!selectedCategoryId) return [];
		return productStore.items.filter((p) => p.categoryId === selectedCategoryId);
	});

	const selectedProductObj = $derived.by(() => {
		return productStore.items.find((p) => p.id === selectedProductId) || null;
	});

	const categoryOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return productCategoryStore.items.map((cat) => ({
			value: cat.id,
			label: cat.name
		}));
	});

	const productOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return availableProducts.map((prod) => ({
			value: prod.id,
			label: prod.name
		}));
	});

	const resellerOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return resellerStore.items.map((r) => ({
			value: r.id,
			label: `${r.ownerName} (${r.phone})`
		}));
	});

	// Derived variants filtered by selected product's assigned attributes
	const variantOptions = $derived.by<ComboboxOption<string>[]>(() => {
		if (!selectedProductId || !selectedProductObj) return [];

		// 1. If product has assignedAttributes configured, look them up from master data
		if (selectedProductObj.assignedAttributes && selectedProductObj.assignedAttributes.length > 0) {
			const matchedVariants: { id: string; name: string }[] = [];
			for (const assigned of selectedProductObj.assignedAttributes) {
				const masterAttr = attributeVariantStore.items.find((a) => a.id === assigned.attributeId);
				if (masterAttr) {
					const activeVars = masterAttr.variants.filter((v) => v.isActive);
					if (assigned.selectedVariantIds && assigned.selectedVariantIds.length > 0) {
						for (const varId of assigned.selectedVariantIds) {
							const v = activeVars.find((item) => item.id === varId);
							if (v) matchedVariants.push(v);
						}
					} else {
						matchedVariants.push(...activeVars);
					}
				}
			}

			if (matchedVariants.length > 0) {
				const uniqueOptions: Record<string, ComboboxOption<string>> = {};
				for (const v of matchedVariants) {
					if (!uniqueOptions[v.name]) {
						uniqueOptions[v.name] = { value: v.name, label: v.name };
					}
				}
				// If currently selected variant is not in options (e.g. custom or loaded from draft), preserve it
				if (selectedVariantName && !uniqueOptions[selectedVariantName]) {
					return [
						{ value: selectedVariantName, label: selectedVariantName },
						...Object.values(uniqueOptions)
					];
				}
				return Object.values(uniqueOptions);
			}
		}

		// 2. Fallback if product has no specific assignedAttributes:
		// Collect active variants from attributeVariantStore
		const options: ComboboxOption<string>[] = [];
		const seenNames: Record<string, boolean> = {};

		if (selectedVariantName) {
			seenNames[selectedVariantName] = true;
			options.push({ value: selectedVariantName, label: selectedVariantName });
		}

		for (const attr of attributeVariantStore.items.filter((a) => a.isActive)) {
			for (const v of attr.variants) {
				if (v.isActive && !seenNames[v.name]) {
					seenNames[v.name] = true;
					options.push({ value: v.name, label: v.name });
				}
			}
		}

		return options;
	});

	// Auto-update UOM when product changes
	$effect(() => {
		const currentId = selectedProductId;
		if (currentId && currentId !== lastAppliedProductId) {
			lastAppliedProductId = currentId;
			if (selectedProductObj) {
				const type = selectedProductObj.calculationType;
				if (type === 'square_meter') {
					uom = 'm2';
					lengthM = 3;
					widthM = 1;
				} else if (type === 'meter_run') {
					uom = 'm_lari';
					lengthM = 2;
					widthM = null;
				} else if (type === 'sheet') {
					uom = 'lembar';
					lengthM = null;
					widthM = null;
				} else {
					uom = 'pcs';
					lengthM = null;
					widthM = null;
				}
			}
		} else if (!currentId) {
			lastAppliedProductId = null;
		}
	});

	// Calculated item preview
	const calculatedItemArea = $derived.by(() => {
		if (uom === 'm2' && lengthM && widthM) {
			return lengthM * widthM * (quantity || 0);
		}
		return 0;
	});

	function resetItemForm() {
		editingItemIndex = null;
		selectedCategoryId = '';
		selectedProductId = '';
		lastAppliedProductId = null;
		selectedVariantName = '';
		uom = 'm2';
		lengthM = null;
		widthM = null;
		quantity = 1;
		productionNotes = '';
		designFileUrl = '';
	}

	function handleAddOrUpdateItem() {
		if (!selectedProductObj) {
			toast.danger('Pilih produk', { description: 'Pilih produk cetak yang diinginkan.' });
			return;
		}

		if (variantOptions.length > 0 && !selectedVariantName.trim()) {
			toast.danger('Pilih variasi produk', {
				description: 'Variasi produk wajib dipilih untuk spesifikasi cetak ini.'
			});
			return;
		}

		if (uom === 'm2') {
			if (!lengthM || lengthM <= 0 || !widthM || widthM <= 0) {
				toast.danger('Dimensi tidak valid', {
					description: 'Panjang dan lebar (meter) harus lebih dari 0 untuk luas m².'
				});
				return;
			}
		} else if (uom === 'm_lari') {
			if (!lengthM || lengthM <= 0) {
				toast.danger('Panjang tidak valid', {
					description: 'Panjang meter lari harus lebih dari 0.'
				});
				return;
			}
		}

		const finalQuantity = quantity && quantity > 0 ? quantity : 1;
		if (finalQuantity <= 0) {
			toast.danger('Jumlah tidak valid', { description: 'Jumlah cetak minimal 1.' });
			return;
		}

		const itemPayload: TicketOrderItemInput = {
			productVariantId: selectedProductObj.id,
			productName: selectedProductObj.name,
			variantName: selectedVariantName.trim() || undefined,
			categoryId: selectedProductObj.categoryId,
			categoryName: selectedProductObj.categoryName,
			uom,
			quantity: finalQuantity,
			lengthM: uom === 'm2' || uom === 'm_lari' ? lengthM : null,
			widthM: uom === 'm2' ? widthM : null,
			productionNotes: productionNotes.trim() || null,
			designFileUrl: designFileUrl.trim() || null,
			finishingIds: []
		};

		if (editingItemIndex !== null) {
			ticketOrderStore.updateCartItem(editingItemIndex, itemPayload);
			toast.success('Item diperbarui', {
				description: `Spesifikasi "${selectedProductObj.name}" berhasil diubah.`
			});
		} else {
			ticketOrderStore.addItemToCart(itemPayload);
			toast.success('Item ditambahkan', {
				description: `"${selectedProductObj.name}" masuk ke keranjang teknis.`
			});
		}

		resetItemForm();
	}

	function handleEditItem(index: number) {
		const target = ticketOrderStore.activeCartItems[index];
		if (!target) return;

		editingItemIndex = index;
		selectedCategoryId = target.categoryId || '';
		selectedProductId = target.productVariantId;
		lastAppliedProductId = target.productVariantId;
		selectedVariantName = target.variantName || '';
		uom = (target.uom as 'm2' | 'm_lari' | 'lembar' | 'pcs' | 'box') || 'm2';
		lengthM = target.lengthM ?? null;
		widthM = target.widthM ?? null;
		quantity = target.quantity;
		productionNotes = target.productionNotes || '';
		designFileUrl = target.designFileUrl || '';
	}

	function handleRemoveItem(index: number) {
		const target = ticketOrderStore.activeCartItems[index];
		ticketOrderStore.removeCartItem(index);
		if (editingItemIndex === index) {
			resetItemForm();
		}
		toast.success('Item dihapus', {
			description: `Item "${target?.productName || ''}" dikeluarkan dari keranjang.`
		});
	}

	async function handleSaveDraft() {
		if (ticketOrderStore.activeCartItems.length === 0) {
			toast.danger('Keranjang masih kosong', {
				description: 'Tambahkan minimal 1 item cetak sebelum menyimpan draft.'
			});
			return;
		}

		const saved = await ticketOrderStore.saveCurrentDraft();
		if (saved) {
			toast.success('Draft tersimpan', {
				description: `Tiket "${saved.jobNumber}" berhasil disimpan sebagai draft desainer.`
			});
			goto(resolve('/(app)/tickets'));
		} else {
			toast.danger('Gagal menyimpan draft', {
				description: ticketOrderStore.error || 'Terjadi kesalahan sistem saat menyimpan.'
			});
		}
	}

	async function handleSubmitToCashier() {
		if (ticketOrderStore.activeCartItems.length === 0) {
			toast.danger('Keranjang masih kosong', {
				description: 'Tambahkan minimal 1 item cetak sebelum mengirim ke kasir.'
			});
			return;
		}

		const saved = await ticketOrderStore.submitCurrentToCashier();
		if (saved) {
			toast.success('Tiket terkirim ke kasir', {
				description: `Tiket "${saved.jobNumber}" berhasil dikirim. Menunggu kasir menerbitkan nota & SPK.`
			});
			goto(resolve('/(app)/tickets'));
		} else {
			toast.danger('Gagal mengirim ke kasir', {
				description: ticketOrderStore.error || 'Terjadi kesalahan sistem saat submit.'
			});
		}
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header & Action Bar -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<Button variant="outline" size="sm" class="size-8 justify-center! p-0!">
				{#snippet child({ props })}
					<a {...props} href={resolve('/(app)/tickets')} aria-label="Kembali ke antrean">
						<IconArrowLeft class="size-4" />
					</a>
				{/snippet}
			</Button>
			<div>
				<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
					{ticketOrderStore.activeEditTicketId ? 'Ubah Tiket Pesanan' : 'Buat Tiket Pesanan Baru'}
				</Typography>
				<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
					Input rincian teknis bersama pelanggan di meja desain, tanpa kalkulasi harga finansial.
				</Typography>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => ticketOrderStore.clearCart()}
				class="gap-1.5"
				title="Kosongkan keranjang aktif"
			>
				<IconRotateCcw class="size-3.5" />
				<span>Reset</span>
			</Button>

			<Button
				variant="outline"
				size="sm"
				onclick={handleSaveDraft}
				disabled={ticketOrderStore.isLoading || ticketOrderStore.activeCartItems.length === 0}
				class="gap-1.5"
			>
				<IconSave class="size-3.5" />
				<span>Simpan Draft</span>
			</Button>

			<Button
				variant="default"
				size="sm"
				onclick={handleSubmitToCashier}
				disabled={ticketOrderStore.isLoading || ticketOrderStore.activeCartItems.length === 0}
				class="gap-1.5"
			>
				<IconSend class="size-3.5" />
				<span>Kirim ke Kasir</span>
			</Button>
		</div>
	</div>

	<!-- Two-Column Responsive Layout -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
		<!-- Left Column: Technical Specification Builder (5 cols) -->
		<div class="flex flex-col gap-4 lg:col-span-5">
			<Card class="p-4 shadow-none">
				<div class="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5">
					<div class="flex items-center gap-2">
						<div
							class="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary"
						>
							<IconLayers class="size-4" />
						</div>
						<Typography variant="h4" as="h2" class="text-sm font-semibold text-foreground">
							{editingItemIndex !== null ? 'Perbarui Item Cetak' : 'Tambah Spesifikasi Item'}
						</Typography>
					</div>
					{#if editingItemIndex !== null}
						<button
							type="button"
							onclick={resetItemForm}
							class="cursor-pointer text-xs text-primary hover:underline"
						>
							Batal Edit
						</button>
					{/if}
				</div>

				<div class="flex flex-col gap-3.5 text-xs">
					<!-- Category Selection -->
					<div>
						<label for="category-combobox" class="mb-1 block font-medium text-foreground">
							Kategori Produk <span class="text-danger">*</span>
						</label>
						<Combobox
							id="category-combobox"
							options={categoryOptions}
							value={selectedCategoryId || undefined}
							onValueChange={(val) => {
								const catId =
									(typeof val === 'string' ? val : (val?.[0] as string | undefined)) ?? '';
								if (catId !== selectedCategoryId) {
									selectedCategoryId = catId;
									selectedProductId = '';
									selectedVariantName = '';
								}
							}}
							size="sm"
							clearable={false}
							labels={{
								placeholder: 'Pilih Kategori Produk',
								searchPlaceholder: 'Cari kategori...',
								empty: 'Tidak ada kategori ditemukan'
							}}
							classes={{ content: 'z-60' }}
							class="w-full"
						/>
					</div>

					<!-- Product Selection -->
					<div>
						<label for="product-combobox" class="mb-1 block font-medium text-foreground">
							Pilihan Produk / Bahan <span class="text-danger">*</span>
						</label>
						<Combobox
							id="product-combobox"
							options={productOptions}
							value={selectedProductId || undefined}
							disabled={!selectedCategoryId}
							onValueChange={(val) => {
								const prodId =
									(typeof val === 'string' ? val : (val?.[0] as string | undefined)) ?? '';
								if (prodId !== selectedProductId) {
									selectedProductId = prodId;
									selectedVariantName = '';
								}
							}}
							size="sm"
							clearable={false}
							labels={{
								placeholder: !selectedCategoryId
									? 'Pilih kategori terlebih dahulu'
									: '-- Pilih Produk Cetak --',
								searchPlaceholder: 'Cari produk / bahan...',
								empty: !selectedCategoryId
									? 'Pilih kategori terlebih dahulu'
									: 'Tidak ada produk dalam kategori ini'
							}}
							classes={{ content: 'z-60' }}
							class="w-full"
						/>
					</div>

					<!-- Variant Selection via Combobox -->
					<div>
						<label for="variant-combobox" class="mb-1 block font-medium text-foreground">
							Variasi Produk <span class="text-[11px] font-normal text-foreground-subtle"
								>(Wajib Dipilih)</span
							>
						</label>
						<Combobox
							id="variant-combobox"
							options={variantOptions}
							value={selectedVariantName || undefined}
							disabled={!selectedProductId}
							onValueChange={(val) => {
								selectedVariantName =
									(typeof val === 'string' ? val : (val?.[0] as string | undefined)) ?? '';
							}}
							size="sm"
							clearable={false}
							creatable={true}
							labels={{
								placeholder: !selectedProductId
									? 'Pilih produk terlebih dahulu'
									: '-- Pilih Varian --',
								searchPlaceholder: 'Cari varian...',
								empty: !selectedProductId
									? 'Pilih produk terlebih dahulu'
									: 'Tidak ada varian ditemukan'
							}}
							classes={{ content: 'z-60' }}
							class="w-full"
						/>
					</div>

					<!-- Description / Item Notes (Placed below Variant and before Dimensions) -->
					<div>
						<label for="item-description" class="mb-1 block font-medium text-foreground">
							Deskripsi / Catatan Item
						</label>
						<textarea
							id="item-description"
							bind:value={productionNotes}
							rows={2}
							placeholder="Contoh: Mata ayam 4 sudut, seaming keliling, potong pas..."
							class="w-full rounded-md border border-border bg-canvas p-2.5 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
						></textarea>
					</div>

					<!-- Dimension & Units (Dynamic based on UOM - hidden for pcs/sheets/etc) -->
					{#if selectedProductObj && (uom === 'm2' || uom === 'm_lari')}
						<div class="rounded-lg border border-border/70 bg-surface-subtle p-3">
							<span class="mb-2 block font-semibold text-foreground">
								Dimensi Produksi ({uom === 'm2' ? 'Meter Persegi' : 'Meter Lari'})
							</span>

							{#if uom === 'm2'}
								<div class="grid grid-cols-2 gap-2">
									<div>
										<label for="length-input" class="mb-1 block text-[11px] text-foreground-subtle">
											Panjang (meter)
										</label>
										<NumberField
											id="length-input"
											size="sm"
											thousandSeparator
											value={lengthM ?? undefined}
											onValueChange={(val) => {
												lengthM = val ?? null;
											}}
											placeholder="0"
											class="w-full"
										/>
									</div>
									<div>
										<label for="width-input" class="mb-1 block text-[11px] text-foreground-subtle">
											Lebar (meter)
										</label>
										<NumberField
											id="width-input"
											size="sm"
											thousandSeparator
											value={widthM ?? undefined}
											onValueChange={(val) => {
												widthM = val ?? null;
											}}
											placeholder="0"
											class="w-full"
										/>
									</div>
								</div>
								<div class="mt-2 text-[11px] text-foreground-subtle">
									Luas: <span class="font-semibold text-primary">
										{((lengthM || 0) * (widthM || 0)).toFixed(2)} m²
									</span>
									• Total:
									<span class="font-semibold text-foreground">
										{calculatedItemArea.toFixed(2)} m²
									</span>
								</div>
							{:else if uom === 'm_lari'}
								<div>
									<label
										for="length-run-input"
										class="mb-1 block text-[11px] text-foreground-subtle"
									>
										Panjang Tarikan Roll (meter lari)
									</label>
									<NumberField
										id="length-run-input"
										size="sm"
										thousandSeparator
										value={lengthM ?? undefined}
										onValueChange={(val) => {
											lengthM = val ?? null;
										}}
										placeholder="0"
										class="w-full"
									/>
								</div>
								<div class="mt-2 text-[11px] text-foreground-subtle">
									Lebar: <span class="font-medium text-foreground">Default lebar roll</span>
									{#if lengthM}
										• Total: <span class="font-semibold text-primary"
											>{((lengthM || 0) * (quantity || 1)).toFixed(2)} m lari</span
										>
									{/if}
								</div>
							{/if}
						</div>
					{/if}

					<!-- Quantity -->
					<div>
						<label for="qty-input" class="mb-1 block font-medium text-foreground">
							Jumlah Kuantitas (Qty) <span class="text-danger">*</span>
						</label>
						<NumberField
							id="qty-input"
							size="sm"
							thousandSeparator
							value={quantity ?? undefined}
							onValueChange={(val) => {
								quantity = val ?? null;
							}}
							placeholder="1"
							class="w-32"
						/>
					</div>

					<Button
						type="button"
						variant="default"
						size="sm"
						onclick={handleAddOrUpdateItem}
						class="mt-2 w-full gap-1.5"
					>
						{#if editingItemIndex !== null}
							<IconCheck class="size-4" />
							<span>Simpan Perubahan Item</span>
						{:else}
							<IconPlus class="size-4" />
							<span>Tambah ke Keranjang Tiket</span>
						{/if}
					</Button>
				</div>
			</Card>
		</div>

		<!-- Right Column: Customer Info & Cart Items (7 cols) -->
		<div class="flex flex-col gap-4 lg:col-span-7">
			<!-- Customer & Transaction Metadata Card -->
			<Card class="p-4 shadow-none">
				<div class="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5">
					<div class="flex items-center gap-2">
						<div
							class="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary"
						>
							<IconUser class="size-4" />
						</div>
						<Typography variant="h4" as="h2" class="text-sm font-semibold text-foreground">
							Data Pelanggan & Catatan Transaksi
						</Typography>
					</div>
					<Badge variant="secondary" size="sm">Tersimpan Otomatis</Badge>
				</div>

				<div class="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
					<!-- Customer Type Selector -->
					<div class="sm:col-span-2">
						<span class="mb-1.5 block font-medium text-foreground">Tipe Pelanggan:</span>
						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={() => {
									ticketOrderStore.activeCustomerType = 'end_user';
									ticketOrderStore.activeResellerId = null;
									ticketOrderStore.persistCartToStorage();
								}}
								class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors {ticketOrderStore.activeCustomerType ===
								'end_user'
									? 'bg-primary text-primary-foreground shadow-2xs'
									: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:text-foreground'}"
							>
								Pelanggan Ritel (Walk-in)
							</button>

							<button
								type="button"
								onclick={() => {
									ticketOrderStore.activeCustomerType = 'reseller';
									ticketOrderStore.persistCartToStorage();
								}}
								class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors {ticketOrderStore.activeCustomerType ===
								'reseller'
									? 'bg-primary text-primary-foreground shadow-2xs'
									: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:text-foreground'}"
							>
								Mitra Biro / Reseller
							</button>
						</div>
					</div>

					<!-- Reseller Dropdown if Reseller -->
					{#if ticketOrderStore.activeCustomerType === 'reseller'}
						<div class="sm:col-span-2">
							<label for="reseller-combobox" class="mb-1 block font-medium text-foreground">
								Pilih Mitra Reseller <span class="text-danger">*</span>
							</label>
							<Combobox
								id="reseller-combobox"
								options={resellerOptions}
								value={ticketOrderStore.activeResellerId ?? undefined}
								onValueChange={(val) => {
									const resellerId =
										typeof val === 'string' ? val : ((val?.[0] as string | undefined) ?? null);
									ticketOrderStore.activeResellerId = resellerId;
									if (resellerId) {
										const found = resellerStore.items.find((r) => r.id === resellerId);
										if (found) {
											ticketOrderStore.activeCustomerName = found.ownerName;
											ticketOrderStore.activeCustomerPhone = found.phone;
										}
									}
									ticketOrderStore.persistCartToStorage();
								}}
								size="sm"
								clearable={false}
								labels={{
									placeholder: '-- Pilih Data Reseller --',
									searchPlaceholder: 'Cari nama reseller / telepon...',
									empty: 'Tidak ada data reseller ditemukan'
								}}
								classes={{ content: 'z-60' }}
								class="w-full"
							/>
						</div>
					{/if}

					<!-- Customer Name -->
					<div>
						<label for="customer-name" class="mb-1 block font-medium text-foreground">
							Nama Pelanggan / Instansi <span class="text-danger">*</span>
						</label>
						<input
							id="customer-name"
							type="text"
							bind:value={ticketOrderStore.activeCustomerName}
							oninput={() => ticketOrderStore.persistCartToStorage()}
							placeholder="Nama pemesan"
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						/>
					</div>

					<!-- Customer Phone -->
					<div>
						<label for="customer-phone" class="mb-1 block font-medium text-foreground">
							Nomor WhatsApp Pelanggan
						</label>
						<input
							id="customer-phone"
							type="tel"
							bind:value={ticketOrderStore.activeCustomerPhone}
							oninput={() => ticketOrderStore.persistCartToStorage()}
							placeholder="08xxxxxxxxxx"
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						/>
					</div>

					<!-- Target Deadline -->
					<div>
						<label for="deadline-input" class="mb-1 block font-medium text-foreground">
							Target Deadline Selesai
						</label>
						<input
							id="deadline-input"
							type="datetime-local"
							value={ticketOrderStore.activeDeadline
								? ticketOrderStore.activeDeadline.slice(0, 16)
								: ''}
							oninput={(e) => {
								ticketOrderStore.activeDeadline = (e.target as HTMLInputElement).value || null;
								ticketOrderStore.persistCartToStorage();
							}}
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						/>
					</div>

					<!-- Notes / Memo Kasir -->
					<div>
						<label for="memo-input" class="mb-1 block font-medium text-foreground">
							Catatan Memo untuk Kasir
						</label>
						<input
							id="memo-input"
							type="text"
							bind:value={ticketOrderStore.activeNotes}
							oninput={() => ticketOrderStore.persistCartToStorage()}
							placeholder="Contoh: Pesanan kilat, titip DP 50%"
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						/>
					</div>
				</div>
			</Card>

			<!-- Active Technical Cart Card (Strictly Zero Price Display) -->
			<Card class="overflow-hidden shadow-none">
				<div class="flex items-center justify-between border-b border-border/70 p-4">
					<div class="flex items-center gap-2">
						<div
							class="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary"
						>
							<IconFileText class="size-4" />
						</div>
						<Typography variant="h4" as="h2" class="text-sm font-semibold text-foreground">
							Keranjang Item Pesanan ({ticketOrderStore.activeCartItems.length} Item)
						</Typography>
					</div>

					{#if ticketOrderStore.totalCartAreaM2 > 0}
						<span class="text-xs text-foreground-subtle">
							Total Luas: <strong class="text-foreground">
								{ticketOrderStore.totalCartAreaM2.toFixed(2)} m²
							</strong>
						</span>
					{/if}
				</div>

				{#if ticketOrderStore.activeCartItems.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<div
							class="flex size-10 items-center justify-center rounded-full bg-surface-subtle text-foreground-subtle"
						>
							<IconLayers class="size-5" />
						</div>
						<span class="mt-2 text-xs font-medium text-foreground">
							Keranjang teknis masih kosong
						</span>
						<span class="mt-0.5 text-[11px] text-foreground-faint">
							Pilih produk dan dimensi di panel kiri, lalu klik "Tambah ke Keranjang".
						</span>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead class="border-b border-border/70 bg-surface-subtle text-foreground-subtle">
								<tr>
									<th class="px-3 py-2.5 font-medium">No</th>
									<th class="px-3 py-2.5 font-medium">Produk & Varian</th>
									<th class="px-3 py-2.5 font-medium">Dimensi / Satuan</th>
									<th class="px-3 py-2.5 font-medium">Qty</th>
									<th class="px-3 py-2.5 font-medium">Instruksi Finishing</th>
									<th class="px-3 py-2.5 text-center font-medium">Aksi</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border/70 text-foreground">
								{#each ticketOrderStore.activeCartItems as item, index (item.productVariantId + '-' + index)}
									<tr class="hover:bg-surface-subtle/50">
										<td class="px-3 py-2.5 text-foreground-subtle">{index + 1}</td>
										<td class="px-3 py-2.5">
											<div class="font-medium text-foreground">{item.productName}</div>
											{#if item.variantName}
												<div class="text-[11px] text-foreground-subtle">{item.variantName}</div>
											{/if}
										</td>
										<td class="px-3 py-2.5 text-foreground-subtle">
											{formatDimensionText(item.uom, item.lengthM, item.widthM, item.quantity)}
										</td>
										<td class="px-3 py-2.5 font-semibold text-primary">
											{item.quantity}
										</td>
										<td class="px-3 py-2.5 text-foreground-subtle">
											{item.productionNotes || '-'}
										</td>
										<td class="px-3 py-2.5 text-center">
											<div class="flex items-center justify-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													onclick={() => handleEditItem(index)}
													class="size-7 justify-center! p-0!"
													title="Edit item"
												>
													<IconEdit2 class="size-3.5 text-foreground-subtle" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onclick={() => handleRemoveItem(index)}
													class="size-7 justify-center! p-0! hover:text-danger"
													title="Hapus item"
												>
													<IconTrash2 class="size-3.5" />
												</Button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div
						class="flex items-center justify-between border-t border-border/70 bg-surface-subtle/50 px-4 py-3 text-xs"
					>
						<span class="text-foreground-subtle">
							Total Keseluruhan: <strong class="text-foreground">
								{ticketOrderStore.totalCartItemsCount} Item
							</strong>
						</span>
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={handleSaveDraft}
								disabled={ticketOrderStore.isLoading}
								class="gap-1.5"
							>
								<IconSave class="size-3.5" />
								<span>Simpan Draft</span>
							</Button>
							<Button
								variant="default"
								size="sm"
								onclick={handleSubmitToCashier}
								disabled={ticketOrderStore.isLoading}
								class="gap-1.5"
							>
								<IconSend class="size-3.5" />
								<span>Kirim ke Kasir</span>
							</Button>
						</div>
					</div>
				{/if}
			</Card>
		</div>
	</div>
</div>
