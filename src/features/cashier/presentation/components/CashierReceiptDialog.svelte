<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cashierStore } from '../../application/cashier.store.svelte';
	import type { CashierOrder } from '../../domain/cashier.entity';
	import { formatCurrency, formatCashierDateTime } from '../../domain/cashier.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import IconPrinter from '~icons/lucide/printer';
	import IconShare2 from '~icons/lucide/share-2';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconFileText from '~icons/lucide/file-text';
	import IconPhone from '~icons/lucide/phone';
	import IconCopy from '~icons/lucide/copy';
	import IconCheck from '~icons/lucide/check';
	import IconX from '~icons/lucide/x';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let order = $derived(cashierStore.lastCompletedOrder || cashierStore.activeOrder);

	let isInputPhoneOpen = $state(false);
	let inputPhoneNumber = $state('');
	let phoneError = $state('');
	let isCopied = $state(false);

	function modalSlideIn(node: Element, { duration = 220 }: { duration?: number } = {}) {
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

	function handlePrint() {
		window.print();
	}

	function handleWhatsAppShare() {
		if (!order) return;
		const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
		if (!cleanPhone || cleanPhone.length < 8) {
			inputPhoneNumber = '';
			phoneError = '';
			isInputPhoneOpen = true;
			return;
		}
		sendWhatsApp(cleanPhone);
	}

	function handleConfirmPhoneSend() {
		const cleanPhone = inputPhoneNumber.replace(/[^0-9]/g, '');
		if (!cleanPhone || cleanPhone.length < 8) {
			phoneError = 'Nomor WhatsApp minimal 8 digit angka.';
			return;
		}
		if (order) {
			order.customerPhone = inputPhoneNumber.trim();
		}
		isInputPhoneOpen = false;
		sendWhatsApp(cleanPhone);
	}

	function sendWhatsApp(phone: string) {
		if (!order) return;
		const isTemp = cashierStore.isTemporaryReceipt;
		const formattedPhone = phone.startsWith('0')
			? '62' + phone.slice(1)
			: phone.startsWith('62')
				? phone
				: '62' + phone;

		const itemsList = order.items
			.map((it) => {
				let spec = '';
				if ((it.uom === 'm2' || it.uom === 'square_meter') && it.lengthM && it.widthM) {
					spec = ` [${it.lengthM}x${it.widthM}m, ${(it.lengthM * it.widthM).toFixed(2)}m²]`;
				} else if ((it.uom === 'm_lari' || it.uom === 'meter_run') && it.lengthM) {
					spec = ` [P: ${it.lengthM}m]`;
				}
				if (it.finishingText && it.finishingText !== '-') {
					spec += ` (${it.finishingText})`;
				}
				return `• *${it.productName}*${spec}\n  ${it.quantity}x @ ${formatCurrency(it.pricePerUnit)} = ${formatCurrency(it.subtotal)}`;
			})
			.join('\n');

		const text = isTemp
			? `Halo Kak *${order.customerName}*,\nBerikut rincian *Nota Sementara* dari *Made Printing*:\n\n*No. Tiket:* ${order.jobNumber}\n*Waktu:* ${formatCashierDateTime(order.createdAt)}\n\n*Rincian Pesanan:*\n${itemsList}\n\n*TOTAL: ${formatCurrency(order.subtotal)}*\n*Status:* Menunggu Pembayaran\n\nSilakan konfirmasi atau lakukan pembayaran ke kasir / transfer rekening toko kami. Terima kasih!`
			: `Halo Kak *${order.customerName}*,\nBerikut tanda bukti pembayaran resmi dari *Made Printing*:\n\n*No. Nota:* ${order.invoiceNumber || order.jobNumber}\n*Waktu:* ${formatCashierDateTime(order.paidAt || order.createdAt)}\n\n*Rincian Pesanan:*\n${itemsList}\n\n*TOTAL: ${formatCurrency(order.subtotal)}*\n*Terbayar (${order.paymentMethod}):* ${formatCurrency(order.totalPaid)}\n*Status:* ${order.status === 'LUNAS' ? 'LUNAS' : 'PANJAR / DP'}\n\nTerima kasih atas pesanannya!`;

		const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
		window.open(url, '_blank');
	}

	function generateReceiptBlob(orderData: CashierOrder, isTemp: boolean): Promise<Blob | null> {
		return new Promise((resolve) => {
			const width = 520;
			let calculatedHeight = 240;
			if (orderData.customerPhone && orderData.customerPhone !== '-') calculatedHeight += 20;
			if (isTemp) calculatedHeight += 32;

			for (const it of orderData.items) {
				calculatedHeight += 44;
				if (
					((it.uom === 'm2' || it.uom === 'square_meter') && it.lengthM && it.widthM) ||
					((it.uom === 'm_lari' || it.uom === 'meter_run') && it.lengthM) ||
					(it.dimensionText && it.dimensionText !== '-' && it.dimensionText !== 'Pcs')
				) {
					calculatedHeight += 18;
				}
			}

			calculatedHeight += 160;

			const scale = 2;
			const canvas = document.createElement('canvas');
			canvas.width = width * scale;
			canvas.height = calculatedHeight * scale;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				resolve(null);
				return;
			}

			ctx.scale(scale, scale);

			// Background paper
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, width, calculatedHeight);

			let y = 30;
			const marginX = 24;
			const rightX = width - marginX;

			const font = (size: number, weight: string = 'normal') => {
				ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif`;
			};

			// Store Header
			ctx.textAlign = 'center';
			ctx.fillStyle = '#111827';
			font(18, 'bold');
			ctx.fillText('MADE PRINTING', width / 2, y);
			y += 18;

			ctx.fillStyle = '#6b7280';
			font(11, 'normal');
			ctx.fillText('Digital Printing & Advertising', width / 2, y);
			y += 15;
			ctx.fillText('Jl. Percetakan No. 88 • 0812-3456-7890', width / 2, y);
			y += 18;

			if (isTemp) {
				font(11, 'bold');
				const textBadge = '*** NOTA SEMENTARA (BELUM LUNAS) ***';
				const badgeWidth = ctx.measureText(textBadge).width + 20;
				ctx.fillStyle = '#fef3c7';
				ctx.strokeStyle = '#f59e0b';
				ctx.lineWidth = 1;
				ctx.beginPath();
				if (ctx.roundRect) {
					ctx.roundRect((width - badgeWidth) / 2, y - 13, badgeWidth, 20, 4);
				} else {
					ctx.rect((width - badgeWidth) / 2, y - 13, badgeWidth, 20);
				}
				ctx.fill();
				ctx.stroke();

				ctx.fillStyle = '#b45309';
				ctx.fillText(textBadge, width / 2, y + 1);
				y += 24;
			}

			const drawDivider = (currentY: number) => {
				ctx.strokeStyle = '#d1d5db';
				ctx.lineWidth = 1;
				ctx.setLineDash([4, 3]);
				ctx.beginPath();
				ctx.moveTo(marginX, currentY);
				ctx.lineTo(rightX, currentY);
				ctx.stroke();
				ctx.setLineDash([]);
			};

			y += 4;
			drawDivider(y);
			y += 18;

			// Meta info
			const drawRow = (label: string, val: string, isValBold: boolean = false) => {
				ctx.textAlign = 'left';
				ctx.fillStyle = '#6b7280';
				font(11, 'normal');
				ctx.fillText(label, marginX, y);

				ctx.textAlign = 'right';
				ctx.fillStyle = '#111827';
				font(11, isValBold ? 'bold' : 'normal');
				ctx.fillText(val, rightX, y);
				y += 18;
			};

			drawRow(
				isTemp ? 'No. Tiket:' : 'No. Nota:',
				isTemp ? orderData.jobNumber : orderData.invoiceNumber || orderData.jobNumber,
				true
			);
			drawRow('Waktu:', formatCashierDateTime(orderData.paidAt || orderData.createdAt));
			drawRow('Pelanggan:', orderData.customerName, true);
			if (orderData.customerPhone && orderData.customerPhone !== '-') {
				drawRow('No. WA:', orderData.customerPhone);
			}
			drawRow('Kasir:', 'Kasir Walk-in');

			y += 4;
			drawDivider(y);
			y += 18;

			// Items
			for (const it of orderData.items) {
				ctx.textAlign = 'left';
				ctx.fillStyle = '#111827';
				font(11, 'bold');
				ctx.fillText(it.productName, marginX, y);
				y += 16;

				let spec = '';
				if ((it.uom === 'm2' || it.uom === 'square_meter') && it.lengthM && it.widthM) {
					spec = `Dimensi: ${it.lengthM} × ${it.widthM} m (${(it.lengthM * it.widthM).toFixed(2)} m²)`;
				} else if ((it.uom === 'm_lari' || it.uom === 'meter_run') && it.lengthM) {
					spec = `Panjang: ${it.lengthM} m`;
				} else if (it.dimensionText && it.dimensionText !== '-' && it.dimensionText !== 'Pcs') {
					spec = it.dimensionText;
				}
				if (it.finishingText && it.finishingText !== '-') {
					spec += (spec ? ' • ' : '') + it.finishingText;
				}

				if (spec) {
					ctx.fillStyle = '#6b7280';
					font(10, 'normal');
					ctx.fillText(spec, marginX, y);
					y += 15;
				}

				let calcText: string;
				if ((it.uom === 'm2' || it.uom === 'square_meter') && it.lengthM && it.widthM) {
					calcText = `${it.quantity} pcs × ${(it.lengthM * it.widthM).toFixed(2)} m² @ ${formatCurrency(it.pricePerUnit)}`;
				} else if ((it.uom === 'm_lari' || it.uom === 'meter_run') && it.lengthM) {
					calcText = `${it.quantity} pcs × ${it.lengthM} m @ ${formatCurrency(it.pricePerUnit)}`;
				} else {
					calcText = `${it.quantity} ${it.uom === 'm2' || it.uom === 'm_lari' ? 'pcs' : it.uom} @ ${formatCurrency(it.pricePerUnit)}`;
				}

				ctx.textAlign = 'left';
				ctx.fillStyle = '#6b7280';
				font(10, 'normal');
				ctx.fillText(calcText, marginX, y);

				ctx.textAlign = 'right';
				ctx.fillStyle = '#111827';
				font(11, 'bold');
				ctx.fillText(formatCurrency(it.subtotal), rightX, y);

				y += 18;
			}

			y += 4;
			drawDivider(y);
			y += 20;

			// Total
			ctx.textAlign = 'left';
			ctx.fillStyle = '#111827';
			font(13, 'bold');
			ctx.fillText('TOTAL:', marginX, y);

			ctx.textAlign = 'right';
			font(15, 'bold');
			ctx.fillText(formatCurrency(orderData.subtotal), rightX, y);
			y += 20;

			if (isTemp) {
				ctx.textAlign = 'left';
				ctx.fillStyle = '#b45309';
				font(11, 'bold');
				ctx.fillText('Status:', marginX, y);

				ctx.textAlign = 'right';
				ctx.fillText('MENUNGGU PEMBAYARAN', rightX, y);
				y += 20;
			} else {
				drawRow(`Bayar (${orderData.paymentMethod}):`, formatCurrency(orderData.totalPaid));
				if (orderData.changeAmount > 0) {
					ctx.textAlign = 'left';
					ctx.fillStyle = '#059669';
					font(11, 'bold');
					ctx.fillText('Kembalian:', marginX, y);

					ctx.textAlign = 'right';
					ctx.fillText(formatCurrency(orderData.changeAmount), rightX, y);
					y += 20;
				} else if (orderData.remainingAmount > 0) {
					ctx.textAlign = 'left';
					ctx.fillStyle = '#b45309';
					font(11, 'bold');
					ctx.fillText('Sisa Tagihan:', marginX, y);

					ctx.textAlign = 'right';
					ctx.fillText(formatCurrency(orderData.remainingAmount), rightX, y);
					y += 20;
				}
			}

			y += 4;
			drawDivider(y);
			y += 20;

			// Footer note
			ctx.textAlign = 'center';
			ctx.fillStyle = '#9ca3af';
			font(10, 'normal');
			if (isTemp) {
				ctx.fillText('* Dokumen ini adalah rincian estimasi tagihan sementara *', width / 2, y);
				y += 14;
				ctx.fillText('Bukan merupakan bukti pembayaran lunas yang sah.', width / 2, y);
			} else {
				ctx.fillText('Terima kasih atas kunjungan Anda!', width / 2, y);
				y += 14;
				ctx.fillText('Barang yang sudah dibeli tidak dapat ditukar.', width / 2, y);
			}

			canvas.toBlob((blob) => resolve(blob), 'image/png');
		});
	}

	async function handleCopyImage() {
		if (!order) return;
		try {
			const blob = await generateReceiptBlob(order, cashierStore.isTemporaryReceipt);
			if (blob && navigator.clipboard && window.ClipboardItem) {
				await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
				isCopied = true;
				setTimeout(() => {
					isCopied = false;
				}, 2500);
			} else {
				fallbackCopyText();
			}
		} catch (err) {
			console.warn('Clipboard write image failed, fallback to text:', err);
			fallbackCopyText();
		}
	}

	function fallbackCopyText() {
		if (!order) return;
		const isTemp = cashierStore.isTemporaryReceipt;
		const itemsList = order.items
			.map((it) => {
				let spec = '';
				if ((it.uom === 'm2' || it.uom === 'square_meter') && it.lengthM && it.widthM) {
					spec = ` [${it.lengthM}x${it.widthM}m, ${(it.lengthM * it.widthM).toFixed(2)}m²]`;
				} else if ((it.uom === 'm_lari' || it.uom === 'meter_run') && it.lengthM) {
					spec = ` [P: ${it.lengthM}m]`;
				}
				if (it.finishingText && it.finishingText !== '-') {
					spec += ` (${it.finishingText})`;
				}
				return `• ${it.productName}${spec}\n  ${it.quantity}x @ ${formatCurrency(it.pricePerUnit)} = ${formatCurrency(it.subtotal)}`;
			})
			.join('\n');

		const text = isTemp
			? `*MADE PRINTING*\n*** NOTA SEMENTARA (BELUM LUNAS) ***\n\nNo. Tiket: ${order.jobNumber}\nWaktu: ${formatCashierDateTime(order.createdAt)}\nPelanggan: ${order.customerName}\n\nRincian Pesanan:\n${itemsList}\n\nTOTAL: ${formatCurrency(order.subtotal)}\nStatus: MENUNGGU PEMBAYARAN\n\n* Dokumen ini adalah rincian estimasi tagihan sementara`
			: `*MADE PRINTING*\n*STRUK PEMBAYARAN KASIR*\n\nNo. Nota: ${order.invoiceNumber || order.jobNumber}\nWaktu: ${formatCashierDateTime(order.paidAt || order.createdAt)}\nPelanggan: ${order.customerName}\n\nRincian Pesanan:\n${itemsList}\n\nTOTAL: ${formatCurrency(order.subtotal)}\nTerbayar: ${formatCurrency(order.totalPaid)}\nStatus: ${order.status === 'LUNAS' ? 'LUNAS' : 'PANJAR / DP'}`;

		navigator.clipboard.writeText(text);
		isCopied = true;
		setTimeout(() => {
			isCopied = false;
		}, 2500);
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
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container with Slide-in Animation & Compact Width -->
		<div
			class="relative z-10 flex w-full max-w-md flex-col rounded-xl border border-border bg-app-surface p-5 shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between pb-3 border-b border-border/30">
				<div class="flex items-center gap-2">
					{#if cashierStore.isTemporaryReceipt}
						<IconFileText class="size-5 text-amber-500" />
						<div class="flex items-center gap-2">
							<span class="text-sm font-bold text-foreground">Preview Nota Sementara</span>
							<span
								class="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20"
							>
								Draft
							</span>
						</div>
					{:else}
						<IconCheckCircle2 class="size-5 text-emerald-500" />
						<span class="text-sm font-bold text-foreground">Struk Pembayaran Kasir</span>
					{/if}
				</div>
				<button
					type="button"
					onclick={onClose}
					class="rounded-md p-1.5 text-foreground-subtle hover:bg-muted hover:text-foreground cursor-pointer"
					aria-label="Tutup dialog"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Thermal Receipt Preview (Standard Theme Font) -->
			{#if order}
				<div
					class="my-3 flex flex-col rounded-lg border border-border/60 bg-muted/30 p-4 text-xs text-foreground space-y-2.5 select-text"
				>
					<!-- Store Header -->
					<div class="text-center pb-2 border-b border-border/40">
						<span class="block font-black text-sm tracking-wide">MADE PRINTING</span>
						<span class="block text-[10px] text-foreground-subtle">
							Digital Printing & Advertising
						</span>
						<span class="block text-[10px] text-foreground-subtle">
							Jl. Percetakan No. 88 • 0812-3456-7890
						</span>
						{#if cashierStore.isTemporaryReceipt}
							<div
								class="mt-1.5 inline-block rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400"
							>
								*** NOTA SEMENTARA (BELUM LUNAS) ***
							</div>
						{/if}
					</div>

					<!-- Meta -->
					<div class="space-y-0.5 text-[11px] pb-2 border-b border-border/40">
						<div class="flex justify-between">
							<span>{cashierStore.isTemporaryReceipt ? 'No. Tiket:' : 'No. Nota:'}</span>
							<span class="font-bold">
								{cashierStore.isTemporaryReceipt
									? order.jobNumber
									: order.invoiceNumber || order.jobNumber}
							</span>
						</div>
						<div class="flex justify-between">
							<span>Waktu:</span>
							<span>{formatCashierDateTime(order.paidAt || order.createdAt)}</span>
						</div>
						<div class="flex justify-between">
							<span>Pelanggan:</span>
							<span class="font-bold">{order.customerName}</span>
						</div>
						{#if order.customerPhone && order.customerPhone !== '-'}
							<div class="flex justify-between">
								<span>No. WA:</span>
								<span>{order.customerPhone}</span>
							</div>
						{/if}
						<div class="flex justify-between">
							<span>Kasir:</span>
							<span>Kasir Walk-in</span>
						</div>
					</div>

					<!-- Items with Luas / Panjang / Finishing -->
					<div class="space-y-2 py-2 border-b border-border/40">
						{#each order.items as it (it.id)}
							<div class="flex flex-col gap-0.5">
								<span class="font-bold text-[11px] text-foreground">{it.productName}</span>

								<!-- Dimensi / Luas (m2) / Panjang (m_lari) info -->
								{#if (it.uom === 'm2' || it.uom === 'square_meter') && it.lengthM && it.widthM}
									<div class="flex items-center gap-1.5 text-[10px] text-foreground-subtle">
										<span>Dimensi: {it.lengthM} × {it.widthM} m ({(it.lengthM * it.widthM).toFixed(2)} m²)</span>
										{#if it.finishingText && it.finishingText !== '-'}
											<span>•</span>
											<span>{it.finishingText}</span>
										{/if}
									</div>
								{:else if (it.uom === 'm_lari' || it.uom === 'meter_run') && it.lengthM}
									<div class="flex items-center gap-1.5 text-[10px] text-foreground-subtle">
										<span>Panjang: {it.lengthM} m</span>
										{#if it.finishingText && it.finishingText !== '-'}
											<span>•</span>
											<span>{it.finishingText}</span>
										{/if}
									</div>
								{:else if it.dimensionText && it.dimensionText !== '-' && it.dimensionText !== 'Pcs'}
									<div class="flex items-center gap-1.5 text-[10px] text-foreground-subtle">
										<span>{it.dimensionText}</span>
										{#if it.finishingText && it.finishingText !== '-'}
											<span>•</span>
											<span>{it.finishingText}</span>
										{/if}
									</div>
								{/if}

								<!-- Price breakdown row -->
								<div class="flex justify-between text-[10px] text-foreground-subtle pt-0.5">
									<span>
										{#if (it.uom === 'm2' || it.uom === 'square_meter') && it.lengthM && it.widthM}
											{it.quantity} pcs × {(it.lengthM * it.widthM).toFixed(2)} m² @ {formatCurrency(it.pricePerUnit)}
										{:else if (it.uom === 'm_lari' || it.uom === 'meter_run') && it.lengthM}
											{it.quantity} pcs × {it.lengthM} m @ {formatCurrency(it.pricePerUnit)}
										{:else}
											{it.quantity} {it.uom === 'm2' || it.uom === 'm_lari' ? 'pcs' : it.uom} @ {formatCurrency(it.pricePerUnit)}
										{/if}
									</span>
									<span class="font-bold text-foreground">{formatCurrency(it.subtotal)}</span>
								</div>
							</div>
						{/each}
					</div>

					<!-- Total & Payment (Directly Total, No Subtotal) -->
					<div class="space-y-1 pt-1.5 text-[11px]">
						<div class="flex justify-between font-black text-sm pt-0.5 border-t border-border/40">
							<span>TOTAL:</span>
							<span>{formatCurrency(order.subtotal)}</span>
						</div>
						{#if cashierStore.isTemporaryReceipt}
							<div class="flex justify-between text-amber-600 dark:text-amber-400 font-bold pt-1">
								<span>Status:</span>
								<span>MENUNGGU PEMBAYARAN</span>
							</div>
						{:else}
							<div class="flex justify-between">
								<span>Bayar ({order.paymentMethod}):</span>
								<span>{formatCurrency(order.totalPaid)}</span>
							</div>
							{#if order.changeAmount > 0}
								<div class="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
									<span>Kembalian:</span>
									<span>{formatCurrency(order.changeAmount)}</span>
								</div>
							{:else if order.remainingAmount > 0}
								<div class="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
									<span>Sisa (Tempo):</span>
									<span>{formatCurrency(order.remainingAmount)}</span>
								</div>
							{/if}
						{/if}
					</div>

					<div class="pt-3 text-center text-[10px] text-foreground-subtle">
						{#if cashierStore.isTemporaryReceipt}
							* Dokumen ini adalah rincian estimasi tagihan sementara *<br />
							Bukan merupakan bukti pembayaran lunas yang sah.
						{:else}
							Terima kasih atas kunjungan Anda!<br />
							Barang yang sudah dibeli tidak dapat ditukar.
						{/if}
					</div>
				</div>
			{/if}

			<!-- Action Buttons (3 Actions: Cetak, Salin Gambar, Kirim WA) -->
			<div class="flex flex-col gap-2">
				<div class="grid grid-cols-3 gap-2">
					<!-- 1. Cetak Thermal Printer -->
					<Button
						variant="default"
						size="sm"
						onclick={handlePrint}
						class="h-8 gap-1.5 rounded-md text-xs font-bold"
					>
						<IconPrinter class="size-3.5 shrink-0" />
						<span>Cetak</span>
					</Button>

					<!-- 2. Salin Gambar Nota (untuk Paste di WA Web) -->
					<Button
						variant="outline"
						size="sm"
						onclick={handleCopyImage}
						class="h-8 gap-1.5 rounded-md text-xs font-bold transition-all {isCopied
							? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
							: 'border-border text-foreground hover:bg-muted'}"
					>
						{#if isCopied}
							<IconCheck class="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
							<span>Tersalin!</span>
						{:else}
							<IconCopy class="size-3.5 shrink-0" />
							<span>Salin Gambar</span>
						{/if}
					</Button>

					<!-- 3. Buka Chat WhatsApp Langsung -->
					<Button
						variant="outline"
						size="sm"
						onclick={handleWhatsAppShare}
						class="h-8 gap-1.5 rounded-md text-xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
					>
						<IconShare2 class="size-3.5 shrink-0" />
						<span>Kirim WA</span>
					</Button>
				</div>

				<Button
					variant="ghost"
					size="sm"
					onclick={onClose}
					class="h-8 rounded-md text-xs cursor-pointer"
				>
					{cashierStore.isTemporaryReceipt ? 'Tutup Preview' : 'Selesai & Lanjut Transaksi Berikutnya'}
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Input Nomor WhatsApp jika belum ada -->
{#if isInputPhoneOpen}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<button
			type="button"
			class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
			onclick={() => (isInputPhoneOpen = false)}
			aria-label="Tutup dialog nomor WA"
			transition:fade={{ duration: 150 }}
		></button>

		<div
			class="relative z-10 flex w-full max-w-sm flex-col rounded-xl border border-border bg-app-surface p-5 shadow-2xl"
			transition:modalSlideIn={{ duration: 200 }}
		>
			<div class="flex items-center justify-between pb-3 border-b border-border/30">
				<div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
					<IconPhone class="size-5" />
					<span class="text-sm font-bold text-foreground">Kirim Nota via WhatsApp</span>
				</div>
				<button
					type="button"
					onclick={() => (isInputPhoneOpen = false)}
					class="rounded-md p-1.5 text-foreground-subtle hover:bg-muted hover:text-foreground cursor-pointer"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<div class="my-3 flex flex-col gap-2.5">
				<p class="text-xs leading-relaxed text-foreground-subtle">
					Pelanggan <strong class="text-foreground">{order?.customerName}</strong> belum memiliki nomor WhatsApp yang tercatat. Masukkan nomor WhatsApp tujuan:
				</p>

				<div class="flex flex-col gap-1">
					<TextField
						placeholder="Contoh: 081234567890"
						value={inputPhoneNumber}
						onValueChange={(val) => {
							inputPhoneNumber = val;
							phoneError = '';
						}}
						class="w-full font-medium"
					>
						{#snippet prefix()}
							<span class="text-xs font-bold text-foreground-subtle">WA</span>
						{/snippet}
					</TextField>

					{#if phoneError}
						<span class="text-[11px] font-semibold text-rose-500">{phoneError}</span>
					{/if}
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (isInputPhoneOpen = false)}
					class="h-8 rounded-md text-xs font-semibold"
				>
					Batal
				</Button>
				<Button
					variant="default"
					size="sm"
					onclick={handleConfirmPhoneSend}
					class="h-8 gap-1.5 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
				>
					<IconShare2 class="size-3.5" />
					<span>Kirim ke WhatsApp</span>
				</Button>
			</div>
		</div>
	</div>
{/if}
