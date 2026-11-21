<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cashierStore } from '../../application/cashier.store.svelte';
	import { formatCurrency } from '../../domain/cashier.entity';
	import type { CashierRetailCatalogItem } from '../../domain/cashier.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconMinus from '~icons/lucide/minus';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconX from '~icons/lucide/x';
	import IconCheck from '~icons/lucide/check';
	import IconChevronLeft from '~icons/lucide/chevron-left';
	import IconChevronRight from '~icons/lucide/chevron-right';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	interface BasketItem {
		catalogItemId: string;
		name: string;
		price: number;
		quantity: number;
		uom: string;
		categoryName: string;
		stock: number;
	}

	let { open, onClose }: Props = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('ALL');
	let basket = $state<BasketItem[]>([]);
	let isSubmitting = $state(false);

	let activeOrder = $derived(cashierStore.activeOrder);

	let categories = $derived.by(() => {
		const cats: string[] = [];
		for (const item of cashierStore.retailCatalog) {
			if (item.categoryName && !cats.includes(item.categoryName)) {
				cats.push(item.categoryName);
			}
		}
		return ['ALL', ...cats];
	});

	let filteredCatalog = $derived.by(() => {
		let list = cashierStore.retailCatalog;
		if (selectedCategory !== 'ALL') {
			list = list.filter((item) => item.categoryName === selectedCategory);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(item) => item.name.toLowerCase().includes(q) || item.categoryName.toLowerCase().includes(q)
			);
		}
		return list;
	});

	let totalQuantity = $derived(basket.reduce((sum, item) => sum + item.quantity, 0));
	let totalAmount = $derived(basket.reduce((sum, item) => sum + item.price * item.quantity, 0));

	let chipsContainer = $state<HTMLDivElement | null>(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	function updateScrollButtons() {
		if (!chipsContainer) return;
		const { scrollLeft, scrollWidth, clientWidth } = chipsContainer;
		canScrollLeft = scrollLeft > 4;
		canScrollRight = scrollLeft + clientWidth < scrollWidth - 4;
	}

	function scrollChips(direction: 'left' | 'right') {
		if (!chipsContainer) return;
		const offset = 180;
		chipsContainer.scrollBy({
			left: direction === 'left' ? -offset : offset,
			behavior: 'smooth'
		});
	}

	$effect(() => {
		if (!open || !chipsContainer) return;
		updateScrollButtons();
		const ro = new ResizeObserver(() => {
			updateScrollButtons();
		});
		ro.observe(chipsContainer);
		return () => ro.disconnect();
	});

	function addToBasket(catalogItem: CashierRetailCatalogItem) {
		const existingIndex = basket.findIndex((i) => i.catalogItemId === catalogItem.id);
		if (existingIndex !== -1) {
			basket[existingIndex].quantity += 1;
		} else {
			basket.push({
				catalogItemId: catalogItem.id,
				name: catalogItem.name,
				price: catalogItem.price,
				quantity: 1,
				uom: catalogItem.uom,
				categoryName: catalogItem.categoryName,
				stock: catalogItem.stock
			});
		}
	}

	function incrementQuantity(catalogItemId: string) {
		const item = basket.find((i) => i.catalogItemId === catalogItemId);
		if (item) {
			item.quantity += 1;
		}
	}

	function decrementQuantity(catalogItemId: string) {
		const index = basket.findIndex((i) => i.catalogItemId === catalogItemId);
		if (index !== -1) {
			if (basket[index].quantity > 1) {
				basket[index].quantity -= 1;
			} else {
				basket.splice(index, 1);
			}
		}
	}

	function setQuantity(catalogItemId: string, qty: number) {
		const index = basket.findIndex((i) => i.catalogItemId === catalogItemId);
		if (index !== -1) {
			if (qty <= 0) {
				basket.splice(index, 1);
			} else {
				basket[index].quantity = Math.floor(qty);
			}
		}
	}

	function removeFromBasket(catalogItemId: string) {
		const index = basket.findIndex((i) => i.catalogItemId === catalogItemId);
		if (index !== -1) {
			basket.splice(index, 1);
		}
	}

	function clearBasket() {
		basket = [];
	}

	async function handleSubmit() {
		if (basket.length === 0 || !activeOrder || isSubmitting) return;

		isSubmitting = true;
		try {
			const payload = basket.map((item) => ({
				catalogItemId: item.catalogItemId,
				name: item.name,
				price: item.price,
				quantity: item.quantity,
				uom: item.uom
			}));

			await cashierStore.addRetailItemsBatch(activeOrder.id, payload);
			basket = [];
			onClose();
		} finally {
			isSubmitting = false;
		}
	}

	function modalSlideIn(node: Element, { duration = 220 } = {}) {
		return {
			duration,
			css: (t: number) => {
				const eased = 1 - Math.pow(1 - t, 3);
				const y = (1 - eased) * 20;
				const scale = 0.96 + 0.04 * eased;
				return `
					transform: translateY(${y}px) scale(${scale});
					opacity: ${eased};
				`;
			}
		};
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-black/50 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container with Smooth Slide-in Animation -->
		<div
			class="relative z-10 flex h-[85vh] max-h-180 w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header (Clean, borderless) -->
			<div class="flex items-center justify-between border-b border-border/40 px-6 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
					>
						<IconShoppingBag class="size-5" />
					</div>
					<div class="flex flex-col">
						<div class="flex items-center gap-2">
							<span class="text-sm font-bold text-foreground">Tambah Item Ritel (Batch)</span>
							{#if activeOrder}
								<span
									class="bg-muted/50 inline-flex items-center rounded border border-border px-2 py-0.5 text-[10px] font-semibold text-foreground-subtle"
								>
									Tiket: {activeOrder.jobNumber} • {activeOrder.customerName}
								</span>
							{/if}
						</div>
						<span class="text-xs text-foreground-subtle">
							Pilih beberapa produk ritel sekaligus untuk langsung ditambahkan ke tiket pesanan
							aktif
						</span>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="hover:bg-muted cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:text-foreground"
					aria-label="Tutup modal"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Two-Panel Grid Layout -->
			<div
				class="grid min-h-0 flex-1 grid-cols-1 divide-y divide-border/40 overflow-hidden md:grid-cols-12 md:divide-x md:divide-y-0"
			>
				<!-- LEFT PANEL: Retail Product Catalog (7 Cols) -->
				<div class="flex min-h-0 flex-col bg-card/20 p-5 md:col-span-7">
					<!-- Search & Filter Bar -->
					<div class="shrink-0 space-y-3">
						<div class="relative">
							<IconSearch
								class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-subtle"
							/>
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Cari nama produk ritel atau kategori..."
								class="h-9 w-full rounded-lg border border-border bg-app-surface pr-8 pl-9 text-xs font-medium text-foreground transition-colors placeholder:text-foreground-faint focus:border-orange-500 focus:outline-none"
							/>
							{#if searchQuery}
								<button
									type="button"
									onclick={() => (searchQuery = '')}
									class="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-foreground-subtle hover:text-foreground"
									aria-label="Hapus pencarian"
								>
									<IconX class="size-3.5" />
								</button>
							{/if}
						</div>

						<!-- Category Chips with Carousel Overlay Chevrons -->
						<div class="group/chips relative">
							<!-- Left Chevron Overlay -->
							{#if canScrollLeft}
								<div
									class="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center bg-linear-to-r from-app-surface via-app-surface/90 to-transparent pr-4 pl-0.5"
								>
									<button
										type="button"
										onclick={() => scrollChips('left')}
										class="hover:bg-muted pointer-events-auto flex size-6 -translate-x-1 cursor-pointer items-center justify-center rounded-full border border-border bg-app-surface text-foreground opacity-0 shadow-xs transition-all duration-200 group-hover/chips:translate-x-0 group-hover/chips:opacity-100 hover:text-foreground"
										aria-label="Scroll kategori ke kiri"
									>
										<IconChevronLeft class="size-3.5" />
									</button>
								</div>
							{/if}

							<!-- Scrollable Chips Container -->
							<div
								bind:this={chipsContainer}
								onscroll={updateScrollButtons}
								class="no-scrollbar flex scrollbar-none items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 text-xs [&::-webkit-scrollbar]:hidden"
							>
								{#each categories as cat (cat)}
									{@const isActive = selectedCategory === cat}
									<button
										type="button"
										onclick={() => (selectedCategory = cat)}
										class="shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors {isActive
											? 'bg-orange-500 text-white shadow-xs'
											: 'hover:bg-muted border border-border/80 bg-app-surface text-foreground-subtle hover:text-foreground'}"
									>
										{cat === 'ALL' ? 'Semua Kategori' : cat}
									</button>
								{/each}
							</div>

							<!-- Right Chevron Overlay -->
							{#if canScrollRight}
								<div
									class="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center bg-linear-to-l from-app-surface via-app-surface/90 to-transparent pr-0.5 pl-4"
								>
									<button
										type="button"
										onclick={() => scrollChips('right')}
										class="hover:bg-muted pointer-events-auto flex size-6 translate-x-1 cursor-pointer items-center justify-center rounded-full border border-border bg-app-surface text-foreground opacity-0 shadow-xs transition-all duration-200 group-hover/chips:translate-x-0 group-hover/chips:opacity-100 hover:text-foreground"
										aria-label="Scroll kategori ke kanan"
									>
										<IconChevronRight class="size-3.5" />
									</button>
								</div>
							{/if}
						</div>
					</div>

					<!-- Catalog Items List -->
					<div class="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
						{#if filteredCatalog.length === 0}
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<div
									class="bg-muted mb-2 flex size-10 items-center justify-center rounded-full text-foreground-subtle"
								>
									<IconSearch class="size-5" />
								</div>
								<span class="text-xs font-semibold text-foreground">Produk tidak ditemukan</span>
								<span class="text-[11px] text-foreground-subtle">
									Coba ubah kata kunci pencarian atau kategori filter
								</span>
							</div>
						{:else}
							{#each filteredCatalog as item (item.id)}
								{@const inBasket = basket.find((b) => b.catalogItemId === item.id)}
								<div
									class="group flex items-center justify-between rounded-lg border p-3 transition-all {inBasket
										? 'border-orange-500/40 bg-orange-500/5'
										: 'hover:bg-muted/30 border-border/70 bg-app-surface hover:border-border'}"
								>
									<div class="flex min-w-0 flex-col pr-3">
										<div class="flex items-center gap-2">
											<span class="truncate text-xs font-bold text-foreground">{item.name}</span>
											{#if inBasket}
												<span
													class="inline-flex items-center gap-0.5 rounded bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold text-orange-600 dark:text-orange-400"
												>
													<IconCheck class="size-2.5" />
													<span>{inBasket.quantity} dipilih</span>
												</span>
											{/if}
										</div>
										<div class="flex items-center gap-2 pt-0.5 text-[11px] text-foreground-subtle">
											<span class="bg-muted py-0.2 rounded px-1.5 text-[10px] font-medium">
												{item.categoryName}
											</span>
											<span>•</span>
											<span>Stok: {item.stock} {item.uom}</span>
										</div>
										<span class="pt-1 text-xs font-bold text-foreground">
											{formatCurrency(item.price)}
										</span>
									</div>

									<div class="shrink-0">
										{#if inBasket}
											<div
												class="inline-flex items-center overflow-hidden rounded-md border border-border bg-app-surface shadow-2xs"
											>
												<button
													type="button"
													onclick={() => decrementQuantity(item.id)}
													class="hover:bg-muted flex size-7 cursor-pointer items-center justify-center border-r border-border/60 text-foreground-subtle transition-colors hover:text-foreground"
													aria-label="Kurangi kuantitas"
												>
													<IconMinus class="size-3" />
												</button>
												<span class="w-7 text-center text-xs font-bold text-foreground select-none">
													{inBasket.quantity}
												</span>
												<button
													type="button"
													onclick={() => incrementQuantity(item.id)}
													class="hover:bg-muted flex size-7 cursor-pointer items-center justify-center border-l border-border/60 text-foreground-subtle transition-colors hover:text-foreground"
													aria-label="Tambah kuantitas"
												>
													<IconPlus class="size-3" />
												</button>
											</div>
										{:else}
											<Button
												variant="outline"
												size="sm"
												onclick={() => addToBasket(item)}
												class="h-7 cursor-pointer gap-1 border-orange-500/30 px-2.5 text-[11px] font-bold text-orange-600 hover:border-orange-500/50 hover:bg-orange-500/10 dark:text-orange-400"
											>
												<IconPlus class="size-3.5" />
												<span>Tambah</span>
											</Button>
										{/if}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>

				<!-- RIGHT PANEL: Selected Items Basket (5 Cols) -->
				<div class="bg-muted/20 flex min-h-0 flex-col p-5 md:col-span-5">
					<!-- Basket Header -->
					<div class="flex shrink-0 items-center justify-between pb-3">
						<div class="flex items-center gap-2">
							<span class="text-xs font-bold tracking-wider text-foreground uppercase">
								Item Terpilih
							</span>
							<span
								class="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400"
							>
								{basket.length}
							</span>
						</div>
						{#if basket.length > 0}
							<button
								type="button"
								onclick={clearBasket}
								class="cursor-pointer text-[11px] font-medium text-foreground-subtle transition-colors hover:text-rose-600"
							>
								Kosongkan
							</button>
						{/if}
					</div>

					<!-- Basket Items Scrollable List -->
					<div class="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
						{#if basket.length === 0}
							<div
								class="bg-muted/10 flex h-full min-h-55 flex-col items-center justify-center rounded-lg border border-border/60 p-6 text-center"
							>
								<div
									class="bg-muted mb-2.5 flex size-10 items-center justify-center rounded-full text-foreground-subtle"
								>
									<IconShoppingBag class="size-5" />
								</div>
								<span class="text-xs font-bold text-foreground">Keranjang Masih Kosong</span>
								<span class="max-w-50 pt-1 text-[11px] text-foreground-subtle">
									Klik tombol + Tambah pada katalog di sebelah kiri untuk memilih item ritel.
								</span>
							</div>
						{:else}
							{#each basket as item (item.catalogItemId)}
								<div
									class="flex flex-col gap-2 rounded-lg border border-border bg-app-surface p-3 shadow-xs"
								>
									<div class="flex items-start justify-between gap-2">
										<div class="flex min-w-0 flex-col">
											<span class="truncate text-xs font-bold text-foreground">{item.name}</span>
											<span class="text-[10px] text-foreground-subtle">
												{formatCurrency(item.price)} / {item.uom}
											</span>
										</div>
										<button
											type="button"
											onclick={() => removeFromBasket(item.catalogItemId)}
											class="cursor-pointer rounded p-1 text-foreground-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-600"
											aria-label="Hapus item"
										>
											<IconTrash2 class="size-3.5" />
										</button>
									</div>

									<div class="flex items-center justify-between border-t border-border/30 pt-1">
										<!-- Stepper wrapped as 1 unified control (Linear style) -->
										<div
											class="inline-flex items-center overflow-hidden rounded-md border border-border bg-app-surface shadow-2xs"
										>
											<button
												type="button"
												onclick={() => decrementQuantity(item.catalogItemId)}
												class="hover:bg-muted flex size-7 cursor-pointer items-center justify-center border-r border-border/60 text-foreground-subtle transition-colors hover:text-foreground"
												aria-label="Kurangi kuantitas"
											>
												<IconMinus class="size-3" />
											</button>
											<input
												type="number"
												min="1"
												value={item.quantity}
												oninput={(e) =>
													setQuantity(item.catalogItemId, Number(e.currentTarget.value))}
												class="no-spinner h-7 w-10 [appearance:textfield] bg-transparent text-center text-xs font-bold text-foreground focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
											/>
											<button
												type="button"
												onclick={() => incrementQuantity(item.catalogItemId)}
												class="hover:bg-muted flex size-7 cursor-pointer items-center justify-center border-l border-border/60 text-foreground-subtle transition-colors hover:text-foreground"
												aria-label="Tambah kuantitas"
											>
												<IconPlus class="size-3" />
											</button>
										</div>

										<!-- Subtotal per item -->
										<div class="text-right">
											<span class="text-xs font-bold text-foreground">
												{formatCurrency(item.price * item.quantity)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						{/if}
					</div>

					<!-- Basket Summary & Submit (Fixed at Bottom of Right Panel) -->
					<div class="mt-4 shrink-0 space-y-3 border-t border-border/40 pt-3">
						<!-- Summary Card -->
						<div class="space-y-1.5 rounded-lg border border-border bg-app-surface p-3">
							<div class="flex items-center justify-between text-[11px] text-foreground-subtle">
								<span>Total Item Terpilih:</span>
								<span class="font-semibold text-foreground">
									{basket.length} jenis ({totalQuantity} pcs)
								</span>
							</div>
							<div class="flex items-center justify-between border-t border-border/30 pt-1">
								<span class="text-xs font-bold text-foreground">Total Tambahan Tiket:</span>
								<span class="text-sm font-black text-orange-600 dark:text-orange-400">
									{formatCurrency(totalAmount)}
								</span>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={onClose}
								class="h-9 flex-1 cursor-pointer rounded-lg text-xs font-bold"
							>
								Batal
							</Button>
							<Button
								variant="default"
								size="sm"
								disabled={basket.length === 0 || isSubmitting}
								onclick={handleSubmit}
								class="h-9 flex-[1.6] cursor-pointer gap-1.5 rounded-lg bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
							>
								{#if isSubmitting}
									<span>Menambahkan...</span>
								{:else}
									<IconPlus class="size-3.5" />
									<span>
										Tambahkan ke Tiket {basket.length > 0 ? `(${basket.length})` : ''}
									</span>
								{/if}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
