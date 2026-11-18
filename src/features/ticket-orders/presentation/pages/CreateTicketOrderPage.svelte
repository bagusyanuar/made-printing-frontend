<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Card } from 'dystopia-linear-lib/components/card';
	import { toast } from 'dystopia-linear-lib/components/toast';

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

	import type { TicketOrderItemInput } from '../../domain/ticket-order.entity';
	import { formatDimensionText } from '../../domain/ticket-order.entity';
	import { ticketOrderStore } from '../../application/ticket-order.store.svelte';

	onMount(() => {
		productCategoryStore.load();
		productStore.load();
		resellerStore.load();
		ticketOrderStore.initCartFromStorage();
	});

	// Form Builder States (Left Column)
	let selectedCategoryId = $state('');
	let selectedProductId = $state('');
	let selectedVariantName = $state('');
	let uom = $state<'m2' | 'm_lari' | 'lembar' | 'pcs' | 'box'>('m2');
	let lengthM = $state<number | null>(3);
	let widthM = $state<number | null>(1);
	let quantity = $state(1);
	let productionNotes = $state('Mata ayam 4 sudut');
	let designFileUrl = $state('');

	let editingItemIndex = $state<number | null>(null);

	// Derived products filtered by selected category
	const availableProducts = $derived.by(() => {
		if (!selectedCategoryId) return productStore.items;
		return productStore.items.filter((p) => p.categoryId === selectedCategoryId);
	});

	const selectedProductObj = $derived.by(() => {
		return productStore.items.find((p) => p.id === selectedProductId) || null;
	});

	// Auto-update UOM when product changes
	$effect(() => {
		if (selectedProductObj) {
			const type = selectedProductObj.calculationType;
			if (type === 'square_meter') {
				uom = 'm2';
				if (!lengthM) lengthM = 3;
				if (!widthM) widthM = 1;
			} else if (type === 'meter_run') {
				uom = 'm_lari';
				if (!lengthM) lengthM = 2;
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
	});

	// Calculated item preview
	const calculatedItemArea = $derived.by(() => {
		if (uom === 'm2' && lengthM && widthM) {
			return lengthM * widthM * quantity;
		}
		return 0;
	});

	function resetItemForm() {
		editingItemIndex = null;
		selectedCategoryId = '';
		selectedProductId = '';
		selectedVariantName = '';
		uom = 'm2';
		lengthM = 3;
		widthM = 1;
		quantity = 1;
		productionNotes = '';
		designFileUrl = '';
	}

	function handleAddOrUpdateItem() {
		if (!selectedProductObj) {
			toast.danger('Pilih produk', { description: 'Pilih produk cetak yang diinginkan.' });
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

		if (quantity <= 0) {
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
			quantity,
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
		selectedVariantName = target.variantName || '';
		uom = (target.uom as 'm2' | 'm_lari' | 'lembar' | 'pcs' | 'box') || 'm2';
		lengthM = target.lengthM ?? 3;
		widthM = target.widthM ?? 1;
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
			goto(resolve('/(app)/transactions/tickets'));
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
			goto(resolve('/(app)/transactions/tickets'));
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
					<a {...props} href={resolve('/(app)/transactions/tickets')} aria-label="Kembali ke antrean">
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
						<label for="category-select" class="mb-1 block font-medium text-foreground">
							Kategori Produk
						</label>
						<select
							id="category-select"
							bind:value={selectedCategoryId}
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						>
							<option value="">Semua Kategori</option>
							{#each productCategoryStore.items as cat (cat.id)}
								<option value={cat.id}>{cat.name}</option>
							{/each}
						</select>
					</div>

					<!-- Product Selection -->
					<div>
						<label for="product-select" class="mb-1 block font-medium text-foreground">
							Pilihan Produk / Bahan <span class="text-danger">*</span>
						</label>
						<select
							id="product-select"
							bind:value={selectedProductId}
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						>
							<option value="" disabled>-- Pilih Produk Cetak --</option>
							{#each availableProducts as prod (prod.id)}
								<option value={prod.id}>{prod.name} ({prod.categoryName})</option>
							{/each}
						</select>
					</div>

					<!-- Variant / Sub-type -->
					<div>
						<label for="variant-input" class="mb-1 block font-medium text-foreground">
							Varian / Tipe Spesifik (Opsional)
						</label>
						<input
							id="variant-input"
							type="text"
							bind:value={selectedVariantName}
							placeholder="Contoh: Korea Tebal / Cetak 4/0 (1 Sisi) / Doff"
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
						/>
					</div>

					<!-- Dimension & Units (Dynamic based on UOM) -->
					<div class="rounded-lg border border-border/70 bg-surface-subtle p-3">
						<span class="mb-2 block font-semibold text-foreground">
							Dimensi & Satuan Produksi
						</span>

						{#if uom === 'm2'}
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="length-input" class="mb-1 block text-[11px] text-foreground-subtle">
										Panjang (meter)
									</label>
									<input
										id="length-input"
										type="number"
										step="0.05"
										min="0.1"
										bind:value={lengthM}
										class="h-8 w-full rounded-md border border-border bg-canvas px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
									/>
								</div>
								<div>
									<label for="width-input" class="mb-1 block text-[11px] text-foreground-subtle">
										Lebar (meter)
									</label>
									<input
										id="width-input"
										type="number"
										step="0.05"
										min="0.1"
										bind:value={widthM}
										class="h-8 w-full rounded-md border border-border bg-canvas px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
									/>
								</div>
							</div>
							<div class="mt-2 text-[11px] text-foreground-subtle">
								Luas: <span class="font-semibold text-primary"
									>{((lengthM || 0) * (widthM || 0)).toFixed(2)} m²</span
								>
								• Total: <span class="font-semibold text-foreground"
									>{calculatedItemArea.toFixed(2)} m²</span
								>
							</div>
						{:else if uom === 'm_lari'}
							<div>
								<label for="length-run-input" class="mb-1 block text-[11px] text-foreground-subtle">
									Panjang Tarikan Roll (meter lari)
								</label>
								<input
									id="length-run-input"
									type="number"
									step="0.1"
									min="0.1"
									bind:value={lengthM}
									class="h-8 w-full rounded-md border border-border bg-canvas px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
								/>
							</div>
						{:else}
							<div class="text-[11px] text-foreground-subtle">
								Satuan hitung: <strong class="text-foreground">{uom.toUpperCase()}</strong> (Dihitung
								berdasarkan kuantitas lembar/pcs).
							</div>
						{/if}

						<div class="mt-2.5">
							<label for="qty-input" class="mb-1 block text-[11px] font-medium text-foreground">
								Jumlah Kuantitas (Qty)
							</label>
							<input
								id="qty-input"
								type="number"
								min="1"
								bind:value={quantity}
								class="h-8 w-24 rounded-md border border-border bg-canvas px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
							/>
						</div>
					</div>

					<!-- Finishing & Production Notes -->
					<div>
						<label for="finishing-notes" class="mb-1 block font-medium text-foreground">
							Instruksi Finishing & Catatan Mesin
						</label>
						<textarea
							id="finishing-notes"
							bind:value={productionNotes}
							rows={2}
							placeholder="Contoh: Mata ayam 4 sudut, seaming keliling, potong pas..."
							class="w-full rounded-md border border-border bg-canvas p-2.5 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
						></textarea>
					</div>

					<!-- Design File Link -->
					<div>
						<label for="file-url" class="mb-1 block font-medium text-foreground">
							URL / Link Berkas Desain Siap Cetak
						</label>
						<input
							id="file-url"
							type="url"
							bind:value={designFileUrl}
							placeholder="https://drive.google.com/... atau link storage"
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
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

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
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
							<label for="reseller-select" class="mb-1 block font-medium text-foreground">
								Pilih Mitra Reseller <span class="text-danger">*</span>
							</label>
							<select
								id="reseller-select"
								bind:value={ticketOrderStore.activeResellerId}
								onchange={(e) => {
									const found = resellerStore.items.find((r) => r.id === (e.target as HTMLSelectElement).value);
									if (found) {
										ticketOrderStore.activeCustomerName = found.ownerName;
										ticketOrderStore.activeCustomerPhone = found.phone;
									}
									ticketOrderStore.persistCartToStorage();
								}}
								class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
							>
								<option value="" disabled>-- Pilih Data Reseller --</option>
								{#each resellerStore.items as r (r.id)}
									<option value={r.id}>{r.ownerName} ({r.phone})</option>
								{/each}
							</select>
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
							value={ticketOrderStore.activeDeadline ? ticketOrderStore.activeDeadline.slice(0, 16) : ''}
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
							Total Luas: <strong class="text-foreground"
								>{ticketOrderStore.totalCartAreaM2.toFixed(2)} m²</strong
							>
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
							Total Keseluruhan: <strong class="text-foreground"
								>{ticketOrderStore.totalCartItemsCount} Item</strong
							>
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
