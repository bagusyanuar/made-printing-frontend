<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cashierStore } from '../../application/cashier.store.svelte';
	import { formatCurrency } from '../../domain/cashier.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconScissors from '~icons/lucide/scissors';
	import IconX from '~icons/lucide/x';
	import IconCheck from '~icons/lucide/check';
	import IconInfo from '~icons/lucide/info';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let activeOrder = $derived(cashierStore.activeOrder);
	let retailItems = $derived(activeOrder?.items.filter((i) => !i.isProduction) ?? []);

	let selectedItemIds = $state<string[]>([]);
	let isSubmitting = $state(false);

	$effect(() => {
		if (open && activeOrder) {
			selectedItemIds = activeOrder.items.filter((i) => !i.isProduction).map((i) => i.id);
		}
	});

	let selectedRetailItems = $derived(
		retailItems.filter((item) => selectedItemIds.includes(item.id))
	);

	let totalSplitAmount = $derived(
		selectedRetailItems.reduce((acc, item) => acc + item.subtotal, 0)
	);

	function toggleSelectItem(itemId: string) {
		if (selectedItemIds.includes(itemId)) {
			selectedItemIds = selectedItemIds.filter((id) => id !== itemId);
		} else {
			selectedItemIds = [...selectedItemIds, itemId];
		}
	}

	function toggleSelectAll() {
		if (selectedItemIds.length === retailItems.length) {
			selectedItemIds = [];
		} else {
			selectedItemIds = retailItems.map((i) => i.id);
		}
	}

	async function handleConfirmSplit() {
		if (!activeOrder || selectedItemIds.length === 0 || isSubmitting) return;

		isSubmitting = true;
		try {
			await cashierStore.splitRetailItemsBatch(activeOrder.id, selectedItemIds);
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

{#if open && activeOrder}
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
			class="relative z-10 flex w-full max-w-lg flex-col rounded-xl border border-border bg-app-surface shadow-2xl overflow-hidden"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header (No harsh divider line) -->
			<div class="flex items-center justify-between px-6 pt-5 pb-3">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
					>
						<IconScissors class="size-4.5" />
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-bold text-foreground">
							Pisahkan Item Ritel ke Nota Baru
						</span>
						<span class="text-xs text-foreground-subtle">
							Tiket: {activeOrder.jobNumber} • {activeOrder.customerName}
						</span>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-muted hover:text-foreground"
					aria-label="Tutup modal"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Body -->
			<div class="flex flex-col gap-3 px-6 py-2">
				<!-- Explanation Card -->
				<div
					class="flex items-start gap-2.5 rounded-lg border border-orange-500/25 bg-orange-500/5 p-3 text-xs"
				>
					<IconInfo class="size-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
					<div class="flex flex-col gap-0.5 leading-relaxed text-foreground-subtle">
						<span class="font-bold text-foreground">Pemisahan Kolektif (Batch)</span>
						<span>
							Seluruh item ritel terpilih akan dipindahkan dari tiket produksi ini ke dalam
							<strong>1 nota ritel baru tersendiri</strong>, sehingga kasir dapat memproses transaksinya secara terpisah tanpa membuat banyak antrean terfragmentasi.
						</span>
					</div>
				</div>

				<!-- Items Selection List Header -->
				<div class="flex items-center justify-between pt-1">
					<span class="text-xs font-bold text-foreground uppercase tracking-wider">
						Pilih Item Ritel yang Dipisahkan:
					</span>
					{#if retailItems.length > 1}
						<button
							type="button"
							onclick={toggleSelectAll}
							class="cursor-pointer text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline"
						>
							{selectedItemIds.length === retailItems.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
						</button>
					{/if}
				</div>

				<!-- Items Selection List -->
				<div class="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
					{#if retailItems.length === 0}
						<div class="py-6 text-center text-xs text-foreground-subtle">
							Tidak ada item ritel pada tiket ini.
						</div>
					{:else}
						{#each retailItems as item (item.id)}
							{@const isSelected = selectedItemIds.includes(item.id)}
							<div
								role="button"
								tabindex="0"
								onclick={() => toggleSelectItem(item.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') toggleSelectItem(item.id);
								}}
								class="flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all {isSelected
									? 'border-orange-500/40 bg-orange-500/5'
									: 'border-border bg-app-surface opacity-60 hover:opacity-100'}"
							>
								<div class="flex items-center gap-3 min-w-0">
									<!-- Checkbox Indicator -->
									<div
										class="flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors {isSelected
											? 'border-orange-500 bg-orange-500 text-white'
											: 'border-border bg-app-surface'}"
									>
										{#if isSelected}
											<IconCheck class="size-3 stroke-[3]" />
										{/if}
									</div>
									<div class="flex flex-col min-w-0">
										<span class="text-xs font-bold text-foreground truncate">
											{item.productName}
										</span>
										<span class="text-[11px] text-foreground-subtle">
											{item.quantity} {item.uom} × {formatCurrency(item.pricePerUnit)}
										</span>
									</div>
								</div>
								<span class="text-xs font-bold text-foreground shrink-0 pl-2">
									{formatCurrency(item.subtotal)}
								</span>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Total Summary Card -->
				<div class="rounded-lg border border-border bg-muted/20 p-3 space-y-1 mt-1">
					<div class="flex items-center justify-between text-[11px] text-foreground-subtle">
						<span>Item Ritel Dipindahkan:</span>
						<span class="font-semibold text-foreground">
							{selectedRetailItems.length} dari {retailItems.length} produk
						</span>
					</div>
					<div class="flex items-center justify-between pt-1 border-t border-border/30">
						<span class="text-xs font-bold text-foreground">Total Nominal Nota Ritel Baru:</span>
						<span class="text-sm font-bold text-orange-600 dark:text-orange-400">
							{formatCurrency(totalSplitAmount)}
						</span>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border/30 mt-2">
				<Button
					variant="outline"
					size="sm"
					onclick={onClose}
					class="cursor-pointer h-9 px-4 rounded-lg text-xs font-bold"
				>
					Batal
				</Button>
				<Button
					variant="default"
					size="sm"
					disabled={selectedItemIds.length === 0 || isSubmitting}
					onclick={handleConfirmSplit}
					class="cursor-pointer h-9 gap-1.5 px-4 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
				>
					{#if isSubmitting}
						<span>Memproses...</span>
					{:else}
						<IconScissors class="size-3.5" />
						<span>
							Pisahkan {selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : ''} ke Nota Baru
						</span>
					{/if}
				</Button>
			</div>
		</div>
	</div>
{/if}