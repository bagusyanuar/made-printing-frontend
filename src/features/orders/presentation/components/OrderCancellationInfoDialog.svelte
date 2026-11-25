<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Order } from '../../domain/order.entity';
	import { formatCurrency, formatOrderDateTime } from '../../domain/order.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import IconBan from '~icons/lucide/ban';
	import IconRotateCcw from '~icons/lucide/rotate-ccw';
	import IconX from '~icons/lucide/x';
	import IconCalendar from '~icons/lucide/calendar';
	import IconReceipt from '~icons/lucide/receipt';
	import IconFileText from '~icons/lucide/file-text';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconEye from '~icons/lucide/eye';

	interface Props {
		open: boolean;
		order: Order | null;
		onClose: () => void;
		onOpenDetail?: (ord: Order) => void;
	}

	let { open, order, onClose, onOpenDetail }: Props = $props();

	const isRefund = $derived(order?.status === 'REFUND');

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

	function handleWindowKeydown(e: KeyboardEvent) {
		if (open && e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open && order}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="cancellation-info-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-overlay backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog detail pembatalan"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header -->
			<div class="flex items-start justify-between border-b border-border/50 px-5 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg border {isRefund
							? 'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400'
							: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'}"
					>
						{#if isRefund}
							<IconRotateCcw class="size-5" />
						{:else}
							<IconBan class="size-5" />
						{/if}
					</div>
					<div class="flex flex-col gap-0.5">
						<Typography
							id="cancellation-info-title"
							variant="h4"
							as="h2"
							class="text-sm font-bold text-foreground"
						>
							Keterangan Pembatalan
						</Typography>
						<Typography variant="small" as="p" class="text-xs text-foreground-subtle">
							{order.invoiceNumber} • {order.customerName}
						</Typography>
					</div>
				</div>

				<button
					type="button"
					onclick={onClose}
					class="focus-visible:ring-focus-ring cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-surface-subtle hover:text-foreground focus-visible:ring-2 focus-visible:outline-hidden"
					aria-label="Tutup modal"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
				<!-- Jenis Pembatalan & Meta -->
				<div class="space-y-2.5 rounded-lg border border-border bg-surface-subtle p-3.5">
					<div class="flex items-center justify-between gap-2">
						<span class="text-foreground-subtle">Jenis Pembatalan</span>
						{#if isRefund}
							<span
								class="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300"
							>
								<IconRotateCcw class="size-3 text-purple-600 dark:text-purple-400" />
								<span>Refund Dana</span>
							</span>
						{:else}
							<Badge variant="danger" size="sm" class="gap-1">
								<IconBan class="size-3" />
								<span>Batal Pesan</span>
							</Badge>
						{/if}
					</div>

					<div class="flex items-center justify-between gap-2">
						<span class="flex items-center gap-1.5 text-foreground-subtle">
							<IconReceipt class="size-3.5" />
							<span>No. Tiket / SPK</span>
						</span>
						<span class="font-semibold text-foreground">{order.jobNumber}</span>
					</div>

					<div class="flex items-center justify-between gap-2">
						<span class="flex items-center gap-1.5 text-foreground-subtle">
							<IconCalendar class="size-3.5" />
							<span>Waktu Dibatalkan</span>
						</span>
						<span class="font-semibold text-foreground">
							{formatOrderDateTime(order.cancelledAt || order.updatedAt)}
						</span>
					</div>

					<div class="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
						<span class="text-foreground-subtle">Total Nilai Nota</span>
						<span class="font-bold text-foreground">{formatCurrency(order.subtotal)}</span>
					</div>
				</div>

				<!-- Alasan Pembatalan -->
				<div class="space-y-1.5">
					<div
						class="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-foreground-subtle uppercase"
					>
						<IconFileText class="size-3.5" />
						<span>Alasan Pembatalan</span>
					</div>
					<div
						class="rounded-lg border border-border bg-app-surface p-3.5 text-xs leading-relaxed text-foreground"
					>
						{order.cancelReason || order.notes || 'Tidak ada keterangan pembatalan.'}
					</div>
				</div>

				<!-- Rincian Pengembalian Dana (khusus Refund) -->
				{#if isRefund}
					<div class="space-y-1.5">
						<div
							class="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-foreground-subtle uppercase"
						>
							<IconCreditCard class="size-3.5" />
							<span>Riwayat Pengembalian Dana</span>
						</div>
						{#if order.paymentHistory.length > 0}
							<div
								class="divide-y divide-border/50 rounded-lg border border-purple-500/20 bg-purple-500/5"
							>
								{#each order.paymentHistory as pay (pay.id)}
									<div class="flex items-start justify-between gap-3 p-3">
										<div class="flex flex-col gap-0.5">
											<span class="font-semibold text-foreground">
												{pay.method}
												{#if pay.referenceNumber}
													<span class="font-normal text-foreground-subtle">
														({pay.referenceNumber})
													</span>
												{/if}
											</span>
											<span class="text-[11px] text-foreground-subtle">
												{formatOrderDateTime(pay.paymentDate)}
												{#if pay.cashierName}
													• {pay.cashierName}
												{/if}
											</span>
											{#if pay.note}
												<span class="mt-0.5 text-[11px] text-foreground-muted">
													{pay.note}
												</span>
											{/if}
										</div>
										<span class="shrink-0 font-bold text-purple-700 dark:text-purple-300">
											{formatCurrency(pay.amount)}
										</span>
									</div>
								{/each}
							</div>
						{:else}
							<div
								class="rounded-lg border border-border bg-surface-subtle p-3 text-foreground-subtle"
							>
								Dana pesanan berstatus refund. Lihat rincian nota untuk detail transaksi.
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border/50 px-5 py-3.5">
				{#if onOpenDetail}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => {
							onClose();
							onOpenDetail(order);
						}}
						class="gap-1.5 text-xs"
					>
						<IconEye class="size-3.5" />
						<span>Lihat Rincian Nota</span>
					</Button>
				{/if}
				<Button type="button" variant="default" size="sm" onclick={onClose} class="text-xs">
					Tutup
				</Button>
			</div>
		</div>
	</div>
{/if}
