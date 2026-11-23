<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Order } from '../../domain/order.entity';
	import { formatCurrency, formatOrderDateTime } from '../../domain/order.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import IconReceipt from '~icons/lucide/receipt';
	import IconX from '~icons/lucide/x';
	import IconUser from '~icons/lucide/user';
	import IconCalendar from '~icons/lucide/calendar';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconCreditCard from '~icons/lucide/credit-card';

	interface Props {
		open: boolean;
		order: Order | null;
		onClose: () => void;
		onOpenPayment?: (ord: Order) => void;
		onOpenReceipt?: (ord: Order) => void;
	}

	let { open, order, onClose, onOpenPayment, onOpenReceipt }: Props = $props();

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

	function getStatusBadge(status: string) {
		switch (status) {
			case 'LUNAS':
				return { label: 'LUNAS', variant: 'success' as const };
			case 'PARTIAL_PAID':
				return { label: 'DP / SEBAGIAN', variant: 'warning' as const };
			case 'UNPAID':
				return { label: 'TEMPO', variant: 'info' as const };
			case 'OVERDUE':
				return { label: 'JATUH TEMPO', variant: 'danger' as const };
			case 'CANCELLED':
				return { label: 'DIBATALKAN', variant: 'secondary' as const };
			default:
				return { label: status, variant: 'secondary' as const };
		}
	}
</script>

{#if open && order}
	{@const statusInfo = getStatusBadge(order.status)}
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

		<!-- Dialog Container -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-border/40 px-6 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconReceipt class="size-5" />
					</div>
					<div class="flex flex-col">
						<div class="flex items-center gap-2">
							<span class="text-sm font-bold text-foreground">{order.invoiceNumber}</span>
							<Badge variant={statusInfo.variant} size="sm">
								{statusInfo.label}
							</Badge>
						</div>
						<span class="text-xs text-foreground-subtle">
							Tiket: {order.jobNumber} • Diterbitkan: {formatOrderDateTime(order.issuedAt)}
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

			<!-- Body -->
			<div class="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
				<!-- Customer & Order Meta -->
				<div class="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3">
					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-1.5 font-bold text-foreground">
							<IconUser class="size-3.5 text-foreground-subtle" />
							<span>{order.customerName}</span>
							{#if order.customerType === 'reseller'}
								<span
									class="rounded bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"
								>
									Reseller
								</span>
							{:else}
								<span
									class="rounded bg-muted px-1.5 py-0.2 text-[9px] font-medium text-foreground-subtle"
								>
									Walk-in
								</span>
							{/if}
						</div>
						<span class="text-[11px] text-foreground-subtle">
							Kontak: {order.customerPhone || '-'}
						</span>
					</div>

					<div class="flex flex-col items-end gap-1 text-right">
						<div class="flex items-center gap-1.5 text-foreground-subtle">
							<IconCalendar class="size-3.5" />
							<span>Jatuh Tempo:</span>
							<span class="font-semibold text-foreground">
								{order.dueDate ? formatOrderDateTime(order.dueDate) : 'Saat Pengambilan / Lunas'}
							</span>
						</div>
						<span class="text-[11px] text-foreground-subtle">
							Tipe: {order.orderType === 'PRODUCTION' ? 'Tiket Produksi Cetak' : 'Pesanan Ritel Langsung'}
						</span>
					</div>
				</div>

				<!-- Itemized Table -->
				<div class="space-y-1.5">
					<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
						Daftar Item ({order.items.length})
					</span>
					<div class="overflow-hidden rounded-lg border border-border">
						<table class="w-full text-left text-xs">
							<thead class="border-b border-border bg-muted/40 text-foreground-subtle">
								<tr>
									<th class="px-3 py-2 font-medium">Produk & Spesifikasi</th>
									<th class="px-3 py-2 text-center font-medium">Qty</th>
									<th class="px-3 py-2 text-right font-medium">Harga Satuan</th>
									<th class="px-3 py-2 text-right font-medium">Subtotal</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border/40 bg-app-surface text-foreground">
								{#each order.items as item (item.id)}
									<tr>
										<td class="px-3 py-2.5">
											<div class="flex flex-col">
												<span class="font-bold">{item.productName}</span>
												<span class="text-[10px] text-foreground-subtle">
													{item.dimensionText} • {item.finishingText || '-'}
												</span>
											</div>
										</td>
										<td class="px-3 py-2.5 text-center font-semibold">
											{item.quantity} {item.uom}
										</td>
										<td class="px-3 py-2.5 text-right text-foreground-subtle">
											{formatCurrency(item.pricePerUnit)}
										</td>
										<td class="px-3 py-2.5 text-right font-bold">
											{formatCurrency(item.subtotal)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- Payment History Log -->
				<div class="space-y-1.5">
					<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
						Riwayat Pembayaran ({order.paymentHistory.length})
					</span>
					{#if order.paymentHistory.length === 0}
						<div class="rounded-lg border border-border/60 bg-muted/10 p-3 text-center text-foreground-subtle">
							Belum ada riwayat pembayaran yang tercatat.
						</div>
					{:else}
						<div class="divide-y divide-border/40 rounded-lg border border-border bg-app-surface">
							{#each order.paymentHistory as pay (pay.id)}
								<div class="flex items-center justify-between p-3 text-xs">
									<div class="flex items-center gap-2.5">
										<div
											class="flex size-7 items-center justify-center rounded-md border border-border bg-muted/30 text-foreground-subtle"
										>
											<IconCreditCard class="size-3.5" />
										</div>
										<div class="flex flex-col">
											<div class="flex items-center gap-2">
												<span class="font-bold text-foreground">Metode: {pay.method}</span>
												{#if pay.referenceNumber}
													<span class="text-[10px] text-foreground-subtle">
														({pay.referenceNumber})
													</span>
												{/if}
											</div>
											<span class="text-[10px] text-foreground-subtle">
												{formatOrderDateTime(pay.paymentDate)} • {pay.note || '-'}
											</span>
										</div>
									</div>
									<span class="font-bold text-emerald-600 dark:text-emerald-400">
										+ {formatCurrency(pay.amount)}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Financial Summary Card -->
				<div class="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
					<div class="flex items-center justify-between text-xs text-foreground-subtle">
						<span>Total Tagihan Faktur:</span>
						<span class="font-bold text-foreground">{formatCurrency(order.subtotal)}</span>
					</div>
					<div class="flex items-center justify-between text-xs text-foreground-subtle">
						<span>Total Telah Dibayar:</span>
						<span class="font-bold text-emerald-600 dark:text-emerald-400">
							{formatCurrency(order.totalPaid)}
						</span>
					</div>
					<div class="flex items-center justify-between border-t border-border/60 pt-2 text-sm font-bold">
						<span class="text-foreground">Sisa Piutang / Tagihan:</span>
						<span
							class={order.remainingAmount > 0
								? 'text-rose-600 dark:text-rose-400 font-black'
								: 'text-emerald-600 dark:text-emerald-400 font-bold'}
						>
							{formatCurrency(order.remainingAmount)}
						</span>
					</div>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="flex items-center justify-between border-t border-border/40 px-6 py-3.5">
				<Button variant="outline" size="sm" onclick={onClose} class="h-8.5 rounded-md text-xs font-semibold">
					Tutup
				</Button>

				<div class="flex items-center gap-2">
					{#if onOpenReceipt}
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								onClose();
								onOpenReceipt(order);
							}}
							class="h-8.5 gap-1.5 rounded-md text-xs font-semibold"
						>
							<IconReceipt class="size-3.5" />
							<span>Cetak Struk / Faktur</span>
						</Button>
					{/if}

					{#if order.remainingAmount > 0 && onOpenPayment}
						<Button
							variant="default"
							size="sm"
							onclick={() => {
								onClose();
								onOpenPayment(order);
							}}
							class="h-8.5 gap-1.5 rounded-md bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
						>
							<IconCheckCircle2 class="size-3.5" />
							<span>Pelunasan Sisa</span>
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
