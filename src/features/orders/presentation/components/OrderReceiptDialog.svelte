<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Order } from '../../domain/order.entity';
	import { formatCurrency, formatOrderDateTime } from '../../domain/order.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconPrinter from '~icons/lucide/printer';
	import IconShare2 from '~icons/lucide/share-2';
	import IconX from '~icons/lucide/x';

	interface Props {
		open: boolean;
		order: Order | null;
		onClose: () => void;
	}

	let { open, order, onClose }: Props = $props();

	let receiptFormat = $state<'THERMAL' | 'A4'>('THERMAL');

	function handlePrint() {
		window.print();
	}

	function handleShareWhatsApp() {
		if (!order) return;

		const phone = order.customerPhone.replace(/[^0-9]/g, '');
		const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;

		const itemsList = order.items
			.map(
				(it, idx) =>
					`${idx + 1}. ${it.productName} (${it.quantity} ${it.uom}) - ${formatCurrency(it.subtotal)}`
			)
			.join('\n');

		const statusText =
			order.status === 'LUNAS'
				? 'LUNAS'
				: order.status === 'PARTIAL_PAID'
					? `DP / SISA TAGIHAN ${formatCurrency(order.remainingAmount)}`
					: `TEMPO / SISA ${formatCurrency(order.remainingAmount)}`;

		const text = `*MADE PRINTING & DIGITAL SIGNAGE*
----------------------------------------
No. Faktur : *${order.invoiceNumber}*
No. Tiket  : ${order.jobNumber}
Pelanggan  : *${order.customerName}*
Tanggal    : ${formatOrderDateTime(order.issuedAt)}
Status     : *${statusText}*
----------------------------------------
*Rincian Pesanan:*
${itemsList}
----------------------------------------
Subtotal   : ${formatCurrency(order.subtotal)}
Terbayar   : ${formatCurrency(order.totalPaid)}
*Sisa Tagihan : ${formatCurrency(order.remainingAmount)}*
----------------------------------------
Terima kasih atas kepercayaan Anda bermitra bersama kami!`;

		const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
		window.open(url, '_blank');
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
</script>

{#if open && order}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-black/50 backdrop-blur-xs transition-opacity print:hidden"
			onclick={onClose}
			aria-label="Tutup dialog"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl print:max-h-none print:w-full print:max-w-none print:border-none print:shadow-none"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header (Hidden on Print) -->
			<div class="flex items-center justify-between border-b border-border/40 px-6 py-3.5 print:hidden">
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => (receiptFormat = 'THERMAL')}
						class="rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {receiptFormat ===
						'THERMAL'
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-muted text-foreground-subtle'}"
					>
						Struk Termal (POS)
					</button>
					<button
						type="button"
						onclick={() => (receiptFormat = 'A4')}
						class="rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {receiptFormat ===
						'A4'
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-muted text-foreground-subtle'}"
					>
						Faktur Standar (A4)
					</button>
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

			<!-- Receipt Content Preview Area -->
			<div class="flex-1 overflow-y-auto bg-muted/30 p-6 print:bg-white print:p-0">
				{#if receiptFormat === 'THERMAL'}
					<!-- Thermal 58mm / 80mm Layout -->
					<div
						class="mx-auto w-full max-w-75 rounded-lg border border-border bg-white p-5 text-[11px] text-black shadow-xs print:max-w-none print:border-none print:p-0 print:shadow-none dark:border-border/60"
					>
						<!-- Store Header -->
						<div class="border-b border-gray-200 pb-3 text-center">
							<span class="block text-sm font-bold tracking-wider">MADE PRINTING</span>
							<span class="block text-[10px] text-gray-600">Digital Printing & Advertising</span>
							<span class="block text-[9px] text-gray-500">Jl. Raya Printing No. 88 • 0812-3456-7890</span>
						</div>

						<!-- Meta Info -->
						<div class="border-b border-gray-200 py-2.5 text-[10px] space-y-0.5">
							<div class="flex justify-between">
								<span>No. Faktur:</span>
								<span class="font-bold">{order.invoiceNumber}</span>
							</div>
							<div class="flex justify-between">
								<span>Tiket SPK:</span>
								<span>{order.jobNumber}</span>
							</div>
							<div class="flex justify-between">
								<span>Tanggal:</span>
								<span>{formatOrderDateTime(order.issuedAt)}</span>
							</div>
							<div class="flex justify-between">
								<span>Pelanggan:</span>
								<span class="font-bold">{order.customerName}</span>
							</div>
						</div>

						<!-- Items -->
						<div class="border-b border-gray-200 py-2.5 space-y-2">
							{#each order.items as item (item.id)}
								<div>
									<div class="font-bold leading-tight">{item.productName}</div>
									<div class="flex justify-between text-[10px] text-gray-600">
										<span>{item.quantity} {item.uom} x {formatCurrency(item.pricePerUnit)}</span>
										<span class="font-bold text-black">{formatCurrency(item.subtotal)}</span>
									</div>
								</div>
							{/each}
						</div>

						<!-- Summary -->
						<div class="border-b border-gray-200 py-2.5 space-y-1 text-right">
							<div class="flex justify-between text-[11px]">
								<span>Total Tagihan:</span>
								<span class="font-bold">{formatCurrency(order.subtotal)}</span>
							</div>
							<div class="flex justify-between text-[11px]">
								<span>Terbayar:</span>
								<span class="font-bold text-gray-700">{formatCurrency(order.totalPaid)}</span>
							</div>
							<div class="flex justify-between text-xs font-bold border-t border-gray-200 pt-1">
								<span>Sisa Tagihan:</span>
								<span>{formatCurrency(order.remainingAmount)}</span>
							</div>
						</div>

						<!-- Footer -->
						<div class="pt-3 text-center text-[10px] text-gray-500 space-y-0.5">
							<span class="block font-bold">
								STATUS: {order.status === 'LUNAS' ? 'LUNAS' : 'BELUM LUNAS'}
							</span>
							<span class="block text-[9px]">Barang yang sudah dicetak tidak dapat ditukar.</span>
							<span class="block text-[9px]">Simpan struk ini sebagai bukti transaksi resmi.</span>
						</div>
					</div>
				{:else}
					<!-- A4 Standard Invoice Preview -->
					<div
						class="mx-auto w-full max-w-md rounded-lg border border-border bg-white p-6 text-xs text-black shadow-xs print:max-w-none print:border-none print:p-0 print:shadow-none"
					>
						<div class="flex items-start justify-between border-b border-gray-200 pb-4">
							<div>
								<span class="block text-base font-black tracking-wide text-primary">MADE PRINTING</span>
								<span class="block text-[11px] text-gray-500">Percetakan Digital, Banner & Merchandise</span>
								<span class="block text-[10px] text-gray-400">NPWP: 01.234.567.8-901.000</span>
							</div>
							<div class="text-right">
								<span class="block text-sm font-bold">FAKTUR PENJUALAN</span>
								<span class="block text-xs font-semibold text-gray-700">{order.invoiceNumber}</span>
								<span class="block text-[10px] text-gray-500">{formatOrderDateTime(order.issuedAt)}</span>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4 py-3 border-b border-gray-200 text-[11px]">
							<div>
								<span class="text-gray-500 block font-bold">Tagihan Kepada:</span>
								<span class="font-bold block text-sm">{order.customerName}</span>
								<span class="text-gray-600 block">{order.customerPhone}</span>
								{#if order.resellerName}
									<span class="text-indigo-600 block font-semibold">Reseller: {order.resellerName}</span>
								{/if}
							</div>
							<div class="text-right">
								<span class="text-gray-500 block font-bold">Rujukan SPK:</span>
								<span class="font-bold block">{order.jobNumber}</span>
								<span class="text-gray-500 block font-bold mt-1">Jatuh Tempo:</span>
								<span class="font-bold block text-rose-600">
									{order.dueDate ? formatOrderDateTime(order.dueDate) : 'Lunas Saat Ambil'}
								</span>
							</div>
						</div>

						<div class="py-3">
							<table class="w-full text-left text-[11px]">
								<thead>
									<tr class="border-b border-gray-300 font-bold text-gray-700">
										<th class="py-1">Deskripsi</th>
										<th class="py-1 text-center">Qty</th>
										<th class="py-1 text-right">Harga</th>
										<th class="py-1 text-right">Total</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									{#each order.items as it (it.id)}
										<tr>
											<td class="py-1.5 font-medium">{it.productName} ({it.dimensionText})</td>
											<td class="py-1.5 text-center">{it.quantity} {it.uom}</td>
											<td class="py-1.5 text-right">{formatCurrency(it.pricePerUnit)}</td>
											<td class="py-1.5 text-right font-bold">{formatCurrency(it.subtotal)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<div class="border-t border-gray-300 pt-3 text-right space-y-1">
							<div class="flex justify-between">
								<span class="text-gray-600">Subtotal:</span>
								<span class="font-bold">{formatCurrency(order.subtotal)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Total Terbayar:</span>
								<span class="font-bold text-emerald-600">{formatCurrency(order.totalPaid)}</span>
							</div>
							<div class="flex justify-between text-sm font-bold border-t border-gray-200 pt-1">
								<span>Sisa Tagihan:</span>
								<span class="text-rose-600">{formatCurrency(order.remainingAmount)}</span>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer Actions (Hidden on Print) -->
			<div class="flex items-center justify-between border-t border-border/40 px-6 py-3.5 print:hidden">
				<Button variant="outline" size="sm" onclick={onClose} class="h-8.5 rounded-md text-xs font-semibold">
					Tutup
				</Button>

				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onclick={handleShareWhatsApp}
						class="h-8.5 gap-1.5 rounded-md border-emerald-500/30 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
					>
						<IconShare2 class="size-3.5" />
						<span>Kirim WhatsApp</span>
					</Button>

					<Button
						variant="default"
						size="sm"
						onclick={handlePrint}
						class="h-8.5 gap-1.5 rounded-md text-xs font-bold"
					>
						<IconPrinter class="size-3.5" />
						<span>Cetak Sekarang</span>
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
