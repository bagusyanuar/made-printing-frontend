<script lang="ts">
	import { cashierStore } from '../../application/cashier.store.svelte';
	import { formatCurrency } from '../../domain/cashier.entity';
	import type { CashierRetailCatalogItem } from '../../domain/cashier.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconPlus from '~icons/lucide/plus';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconX from '~icons/lucide/x';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let customerName = $state('');
	let customerPhone = $state('');
	let selectedItems = $state<
		Array<{
			catalogItemId: string;
			name: string;
			price: number;
			quantity: number;
			uom: string;
		}>
	>([]);

	let catalog = $derived(cashierStore.retailCatalog);

	let totalCalculated = $derived(
		selectedItems.reduce((acc, it) => acc + it.price * it.quantity, 0)
	);

	function addItem(catItem: CashierRetailCatalogItem) {
		const existing = selectedItems.find((i) => i.catalogItemId === catItem.id);
		if (existing) {
			existing.quantity += 1;
		} else {
			selectedItems.push({
				catalogItemId: catItem.id,
				name: catItem.name,
				price: catItem.price,
				quantity: 1,
				uom: catItem.uom
			});
		}
	}

	function removeItem(index: number) {
		selectedItems.splice(index, 1);
	}

	async function handleCreate() {
		if (!customerName.trim() || selectedItems.length === 0) return;

		await cashierStore.createRetailOrder({
			customerName: customerName.trim(),
			customerPhone: customerPhone.trim() || undefined,
			items: selectedItems
		});

		customerName = '';
		customerPhone = '';
		selectedItems = [];
		onClose();
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
			class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
			onclick={onClose}
			aria-label="Tutup dialog"
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 flex w-full max-w-xl flex-col rounded-lg border border-border bg-app-surface p-5 shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between pb-3 border-b border-border/30">
				<div class="flex items-center gap-2.5">
					<div
						class="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"
					>
						<IconShoppingBag class="size-5" />
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-bold text-foreground">
							Buat Nota Transaksi Ritel Walk-in
						</span>
						<span class="text-xs text-foreground-subtle">
							Penjualan barang non-produksi (minuman, ATK, standing roll up, frame)
						</span>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="rounded-md p-1.5 text-foreground-subtle hover:bg-muted hover:text-foreground"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Customer Info Form -->
			<div class="my-3 grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-bold text-foreground-subtle uppercase">
						Nama Pelanggan <span class="text-rose-500">*</span>
					</span>
					<input
						type="text"
						bind:value={customerName}
						placeholder="Contoh: Pak Budi Walk-in"
						class="h-8 rounded-md border border-border bg-muted/40 px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-[10px] font-bold text-foreground-subtle uppercase">
						No. Handphone (Opsional)
					</span>
					<input
						type="text"
						bind:value={customerPhone}
						placeholder="0812..."
						class="h-8 rounded-md border border-border bg-muted/40 px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
					/>
				</div>
			</div>

			<!-- Quick Catalog Add List -->
			<div class="flex flex-col gap-2">
				<span class="text-[10px] font-bold text-foreground-subtle uppercase tracking-wider">
					Pilih Produk Ritel
				</span>
				<div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
					{#each catalog as catItem (catItem.id)}
						<button
							type="button"
							onclick={() => addItem(catItem)}
							class="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 p-2 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
						>
							<div class="flex flex-col truncate pr-1">
								<span class="text-xs font-bold text-foreground truncate">{catItem.name}</span>
								<span class="text-[10px] text-foreground-subtle">{catItem.categoryName}</span>
							</div>
							<span class="text-xs font-black text-primary shrink-0">
								{formatCurrency(catItem.price)}
							</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Selected Items Table -->
			<div class="mt-3 flex flex-col gap-2">
				<span class="text-[10px] font-bold text-foreground-subtle uppercase tracking-wider">
					Item Terpilih ({selectedItems.length})
				</span>

				{#if selectedItems.length === 0}
					<div
						class="rounded-lg border border-border/40 p-4 text-center text-xs text-foreground-subtle"
					>
						Klik produk di atas untuk menambahkan ke keranjang nota ritel.
					</div>
				{:else}
					<div class="flex flex-col divide-y divide-border/20 max-h-36 overflow-y-auto">
						{#each selectedItems as it, idx (it.catalogItemId)}
							<div class="flex items-center justify-between py-2 text-xs">
								<div class="flex flex-1 flex-col">
									<span class="font-bold text-foreground">{it.name}</span>
									<span class="text-[10px] text-foreground-subtle">
										{formatCurrency(it.price)} x {it.quantity} {it.uom}
									</span>
								</div>

								<div class="flex items-center gap-3">
									<div class="flex items-center gap-1">
										<button
											type="button"
											onclick={() => {
												if (it.quantity > 1) it.quantity -= 1;
											}}
											class="size-6 rounded-md border border-border text-center font-bold hover:bg-muted"
										>
											-
										</button>
										<span class="w-6 text-center font-bold">{it.quantity}</span>
										<button
											type="button"
											onclick={() => (it.quantity += 1)}
											class="size-6 rounded-md border border-border text-center font-bold hover:bg-muted"
										>
											+
										</button>
									</div>

									<span class="w-20 text-right font-black text-foreground">
										{formatCurrency(it.price * it.quantity)}
									</span>

									<button
										type="button"
										onclick={() => removeItem(idx)}
										class="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md"
									>
										<IconTrash2 class="size-3.5" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Total & Submit -->
			<div class="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
				<div class="flex flex-col">
					<span class="text-[10px] font-bold uppercase text-foreground-subtle">
						Total Tagihan
					</span>
					<span class="text-base font-black text-foreground">
						{formatCurrency(totalCalculated)}
					</span>
				</div>

				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onclick={onClose}
						class="h-8 rounded-md text-xs font-bold"
					>
						Batal
					</Button>
					<Button
						variant="default"
						size="sm"
						onclick={handleCreate}
						disabled={!customerName.trim() || selectedItems.length === 0}
						class="h-8 gap-1.5 rounded-md text-xs font-bold"
					>
						<IconPlus class="size-4" />
						<span>Buat Nota & Masuk Antrean</span>
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
