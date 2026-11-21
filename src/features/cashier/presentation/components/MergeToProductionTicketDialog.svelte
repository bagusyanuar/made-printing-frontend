<script lang="ts">
	import { cashierStore } from '../../application/cashier.store.svelte';
	import { formatCurrency } from '../../domain/cashier.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconLayers from '~icons/lucide/layers';
	import IconCheck from '~icons/lucide/check';
	import IconX from '~icons/lucide/x';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let activeOrder = $derived(cashierStore.activeOrder);
	let selectedTargetId = $state<string | null>(null);

	let productionOrders = $derived(
		cashierStore.orders.filter(
			(o) => o.orderType === 'PRODUCTION' && o.status === 'PENDING_PAYMENT'
		)
	);

	async function handleMerge() {
		if (!activeOrder || !selectedTargetId) return;
		await cashierStore.mergeToProduction(activeOrder.id, selectedTargetId);
		selectedTargetId = null;
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
			class="relative z-10 flex w-full max-w-lg flex-col rounded-lg border border-border bg-app-surface p-5 shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between pb-3 border-b border-border/30">
				<div class="flex items-center gap-2.5">
					<div
						class="flex size-9 items-center justify-center rounded-md bg-blue-500/10 text-blue-500"
					>
						<IconLayers class="size-5" />
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-bold text-foreground">
							Gabung ke Tiket Cetak Produksi
						</span>
						<span class="text-xs text-foreground-subtle">
							Gabungkan nota ritel ini ke tiket produksi agar dibayar dalam 1 nota
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

			<div class="my-3 flex flex-col gap-2">
				<span class="text-[10px] font-bold text-foreground-subtle uppercase tracking-wider">
					Pilih Tiket Produksi Tujuan
				</span>

				{#if productionOrders.length === 0}
					<div class="py-8 text-center text-xs text-foreground-subtle">
						Tidak ada tiket produksi aktif yang pending payment.
					</div>
				{:else}
					<div class="flex flex-col gap-2 max-h-56 overflow-y-auto">
						{#each productionOrders as prod (prod.id)}
							{@const isSelected = selectedTargetId === prod.id}
							<button
								type="button"
								onclick={() => (selectedTargetId = prod.id)}
								class="flex items-center justify-between rounded-md border p-2.5 text-left transition-all {isSelected
									? 'border-primary bg-primary/10'
									: 'border-border/60 bg-muted/20 hover:border-border'}"
							>
								<div class="flex flex-col gap-0.5">
									<span class="text-xs font-bold text-foreground">{prod.jobNumber}</span>
									<span class="text-[11px] text-foreground-subtle">
										Pelanggan: <strong class="text-foreground">{prod.customerName}</strong>
									</span>
									<span class="text-[10px] text-foreground-subtle">
										Desainer: {prod.designerName || '-'}
									</span>
								</div>

								<div class="flex items-center gap-2">
									<span class="text-xs font-black text-foreground">
										{formatCurrency(prod.subtotal)}
									</span>
									{#if isSelected}
										<div
											class="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
										>
											<IconCheck class="size-3" />
										</div>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="mt-4 flex items-center justify-end gap-2 border-t border-border/30 pt-3">
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
					onclick={handleMerge}
					disabled={!selectedTargetId}
					class="h-8 gap-1.5 rounded-md text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
				>
					<IconLayers class="size-4" />
					<span>Gabungkan Nota</span>
				</Button>
			</div>
		</div>
	</div>
{/if}
