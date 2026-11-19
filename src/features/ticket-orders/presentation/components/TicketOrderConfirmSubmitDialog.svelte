<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import IconX from '~icons/lucide/x';
	import IconSend from '~icons/lucide/send';
	import IconUser from '~icons/lucide/user';
	import IconClock from '~icons/lucide/clock';
	import IconFileText from '~icons/lucide/file-text';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';

	import type { TicketOrderConfirmData } from '../../domain/ticket-order.entity';
	import { formatDimensionText } from '../../domain/ticket-order.entity';

	interface Props {
		isOpen?: boolean;
		data: TicketOrderConfirmData;
		isSubmitting?: boolean;
		onConfirm: () => Promise<void>;
		onClose?: () => void;
	}

	let {
		isOpen = $bindable(false),
		data,
		isSubmitting = false,
		onConfirm,
		onClose
	}: Props = $props();

	function modalSlideIn(node: Element, { duration = 250 } = {}) {
		return {
			duration,
			css: (t: number) => {
				const eased = 1 - Math.pow(1 - t, 4);
				const y = (1 - eased) * -24;
				const scale = 0.95 + 0.05 * eased;
				return `
					transform: translateY(${y}px) scale(${scale});
					opacity: ${eased};
				`;
			}
		};
	}

	function handleClose() {
		if (isSubmitting) return;
		isOpen = false;
		onClose?.();
	}

	function formatDeadlineDisplay(val?: string | null): string {
		if (!val) return 'Normal (Tanpa Deadline Khusus)';
		try {
			const d = new Date(val);
			if (isNaN(d.getTime())) return val;
			return (
				d.toLocaleString('id-ID', {
					weekday: 'short',
					day: 'numeric',
					month: 'short',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				}) + ' WIB'
			);
		} catch {
			return val;
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
			onclick={handleClose}
			aria-label="Tutup dialog konfirmasi"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container with Slide-in Animation -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 250 }}
		>
			<!-- Dialog Header -->
			<div class="flex items-center justify-between border-b border-border/70 p-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<IconSend class="size-4.5" />
					</div>
					<div>
						<Typography variant="h4" as="h2" class="text-sm font-bold text-foreground">
							Konfirmasi Kirim ke Kasir
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							Cek kembali data pesanan sebelum dialihkan ke kasir.
						</Typography>
					</div>
				</div>
				<button
					type="button"
					disabled={isSubmitting}
					onclick={handleClose}
					class="cursor-pointer rounded-lg p-1 text-foreground-subtle hover:bg-surface-subtle hover:text-foreground disabled:opacity-50"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Dialog Body (Scrollable) -->
			<div class="flex flex-col gap-4 overflow-y-auto p-4 text-xs">
				<!-- Customer & Deadline Card -->
				<div class="rounded-lg border border-border/70 bg-surface-subtle p-3">
					<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
						<div>
							<div class="flex items-center gap-1.5 text-foreground-subtle">
								<IconUser class="size-3.5" />
								<span>Pelanggan</span>
							</div>
							<div class="mt-1 flex items-center gap-1.5">
								<strong class="text-foreground">
									{data.customerType === 'reseller'
										? data.resellerName || 'Mitra Reseller'
										: data.customerName || 'Walk-in Customer'}
								</strong>
								<Badge
									variant={data.customerType === 'reseller' ? 'default' : 'secondary'}
									size="sm"
									class="text-[10px]"
								>
									{data.customerType === 'reseller' ? 'Biro / Reseller' : 'Walk-in'}
								</Badge>
							</div>
							{#if data.customerPhone && data.customerPhone !== '-'}
								<span class="mt-0.5 block text-[11px] text-foreground-subtle">
									WA: {data.customerPhone}
								</span>
							{/if}
						</div>

						<div>
							<div class="flex items-center gap-1.5 text-foreground-subtle">
								<IconClock class="size-3.5 text-primary" />
								<span>Deadline Pengerjaan</span>
							</div>
							<div class="mt-1 font-semibold text-foreground">
								{formatDeadlineDisplay(data.deadline)}
							</div>
						</div>
					</div>

					{#if data.notes && data.notes.trim()}
						<div class="mt-2.5 border-t border-border/60 pt-2 text-[11px]">
							<span class="text-foreground-subtle">Memo untuk Kasir:</span>
							<div class="mt-0.5 font-medium text-foreground italic">"{data.notes}"</div>
						</div>
					{/if}
				</div>

				<!-- Items Summary -->
				<div>
					<div class="mb-2 flex items-center justify-between font-semibold text-foreground">
						<div class="flex items-center gap-1.5">
							<IconFileText class="size-3.5 text-foreground-subtle" />
							<span>Rincian Item Cetakan ({data.items.length} Item)</span>
						</div>
					</div>

					<div class="divide-y divide-border/60 rounded-lg border border-border/70 bg-canvas">
						{#each data.items as item, index (item.productVariantId + '-' + index)}
							<div class="flex items-start justify-between gap-3 p-2.5">
								<div class="flex-1">
									<div class="font-medium text-foreground">
										{item.productName}{#if item.variantName && item.variantName.toLowerCase() !== 'default'}
											({item.variantName}){/if}
									</div>
									<div class="mt-0.5 text-[11px] text-foreground-subtle">
										Ukuran: {formatDimensionText(
											item.uom,
											item.lengthM,
											item.widthM,
											item.quantity
										)}
									</div>
									{#if item.productionNotes}
										<div class="mt-1">
											<span
												class="inline-block rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
											>
												Catatan: {item.productionNotes}
											</span>
										</div>
									{/if}
								</div>
								<div class="text-right">
									<span class="font-bold text-foreground">{item.quantity}</span>
									<span class="text-[11px] text-foreground-subtle">
										{item.uom === 'm2' ? 'lbr' : item.uom}
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Alert Banner with Red Border & Top-Aligned Icon + Text -->
				<div
					class="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-[11px] text-foreground-subtle"
				>
					<IconCheckCircle2 class="mt-0.5 size-4 shrink-0 text-danger" />
					<p class="leading-relaxed">
						Setelah dikirim, tiket ini akan langsung muncul di antrean kasir untuk dibuatkan invoice
						& nota SPK.
					</p>
				</div>
			</div>

			<!-- Dialog Footer Actions -->
			<div
				class="flex items-center justify-end gap-2 border-t border-border/70 bg-surface-subtle/50 p-3"
			>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={isSubmitting}
					onclick={handleClose}
				>
					Cek Kembali
				</Button>
				<Button
					type="button"
					variant="default"
					size="sm"
					disabled={isSubmitting}
					onclick={onConfirm}
					class="gap-1.5"
				>
					<IconSend class="size-3.5" />
					<span>{isSubmitting ? 'Mengirim...' : 'Ya, Kirim ke Kasir'}</span>
				</Button>
			</div>
		</div>
	</div>
{/if}
