<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Order, OrderPaymentMethod } from '../../domain/order.entity';
	import { formatCurrency } from '../../domain/order.entity';
	import { orderStore } from '../../application/order.store.svelte';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import { toast } from 'dystopia-linear-lib/components/toast';
	import IconBanknote from '~icons/lucide/banknote';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconQrCode from '~icons/lucide/qr-code';
	import IconX from '~icons/lucide/x';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';

	interface Props {
		open: boolean;
		order: Order | null;
		onClose: () => void;
		onSuccess?: () => void;
	}

	let { open, order, onClose, onSuccess }: Props = $props();

	let paymentAmount = $state<number | undefined>(undefined);
	let paymentMethod = $state<OrderPaymentMethod>('CASH');
	let referenceNumber = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);

	$effect(() => {
		if (open && order) {
			paymentAmount = order.remainingAmount;
			paymentMethod = 'CASH';
			referenceNumber = '';
			notes =
				order.fulfillmentStatus === 'PICKED_UP'
					? 'Pelunasan piutang pesanan yang telah diambil'
					: 'Pelunasan sisa tagihan pesanan kasir';
		}
	});

	function setFullAmount() {
		if (order) {
			paymentAmount = order.remainingAmount;
		}
	}

	async function handleSubmit() {
		if (!order || !paymentAmount || paymentAmount <= 0 || isSubmitting) return;

		isSubmitting = true;
		try {
			const success = await orderStore.settlePayment(order.id, {
				amount: paymentAmount,
				method: paymentMethod,
				referenceNumber: referenceNumber.trim() || undefined,
				note: notes.trim() || undefined
			});

			if (success) {
				toast.success('Pelunasan berhasil dicatat', {
					description: `Pembayaran sebesar ${formatCurrency(paymentAmount)} untuk ${order.invoiceNumber} berhasil disimpan.`
				});
				onClose();
				onSuccess?.();
			} else {
				toast.danger('Gagal memproses pelunasan', {
					description: orderStore.error || 'Terjadi kesalahan sistem saat memproses pelunasan.'
				});
			}
		} finally {
			isSubmitting = false;
		}
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
			class="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-border/40 px-6 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
					>
						<IconCheckCircle2 class="size-5" />
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-bold text-foreground">Pelunasan Tagihan Pesanan</span>
						<span class="text-xs text-foreground-subtle">
							{order.invoiceNumber} • {order.customerName}
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

			<!-- Form Body -->
			<div class="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
				<!-- Outstanding Balance Card -->
				<div
					class="bg-muted/20 flex items-center justify-between rounded-lg border border-border p-3.5"
				>
					<div class="flex flex-col gap-0.5">
						<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
							Sisa Tagihan Tertunggak
						</span>
						<span class="text-base font-black text-rose-600 dark:text-rose-400">
							{formatCurrency(order.remainingAmount)}
						</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onclick={setFullAmount}
						class="h-7 cursor-pointer rounded-md px-2.5 text-[11px] font-semibold"
					>
						Lunasi Penuh
					</Button>
				</div>

				<!-- Amount Input -->
				<div class="flex flex-col gap-1.5">
					<label
						for="settle-amount"
						class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
					>
						Nominal Pembayaran <span class="text-rose-500">*</span>
					</label>
					<NumberField
						id="settle-amount"
						value={paymentAmount}
						onValueChange={(val) => (paymentAmount = val)}
						min={1000}
						max={order.remainingAmount}
						thousandSeparator={true}
						class="h-9 w-full rounded-md text-sm font-bold"
					>
						{#snippet prefix()}
							<span class="text-xs font-bold text-foreground-subtle">Rp</span>
						{/snippet}
					</NumberField>
				</div>

				<!-- Payment Method -->
				<div class="flex flex-col gap-1.5">
					<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
						Metode Pembayaran
					</span>
					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							onclick={() => (paymentMethod = 'CASH')}
							class="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 text-center transition-all {paymentMethod ===
							'CASH'
								? 'border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300'
								: 'hover:bg-muted/40 border-border/80 bg-app-surface text-foreground-subtle hover:text-foreground'}"
						>
							<IconBanknote class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
							<span class="text-xs">Tunai</span>
						</button>

						<button
							type="button"
							onclick={() => (paymentMethod = 'TRANSFER')}
							class="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 text-center transition-all {paymentMethod ===
							'TRANSFER'
								? 'border-sky-500/50 bg-sky-500/10 font-bold text-sky-700 dark:text-sky-300'
								: 'hover:bg-muted/40 border-border/80 bg-app-surface text-foreground-subtle hover:text-foreground'}"
						>
							<IconCreditCard class="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
							<span class="text-xs">Transfer</span>
						</button>

						<button
							type="button"
							onclick={() => (paymentMethod = 'QRIS')}
							class="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 text-center transition-all {paymentMethod ===
							'QRIS'
								? 'border-violet-500/50 bg-violet-500/10 font-bold text-violet-700 dark:text-violet-300'
								: 'hover:bg-muted/40 border-border/80 bg-app-surface text-foreground-subtle hover:text-foreground'}"
						>
							<IconQrCode class="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
							<span class="text-xs">QRIS</span>
						</button>
					</div>
				</div>

				<!-- Reference Number (Optional for Transfer/QRIS) -->
				{#if paymentMethod === 'TRANSFER' || paymentMethod === 'QRIS'}
					<div class="flex flex-col gap-1">
						<label
							for="settle-ref"
							class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
						>
							Nomor Referensi / Bukti Transfer
						</label>
						<input
							id="settle-ref"
							type="text"
							bind:value={referenceNumber}
							placeholder="Contoh: BCA-8829104"
							class="bg-muted/30 h-8 w-full rounded-md border border-border px-2.5 text-xs font-semibold text-foreground transition-colors placeholder:text-foreground-faint focus:border-primary focus:outline-none"
						/>
					</div>
				{/if}

				<!-- Notes -->
				<div class="flex flex-col gap-1">
					<label
						for="settle-notes"
						class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
					>
						Catatan Pelunasan (Opsional)
					</label>
					<input
						id="settle-notes"
						type="text"
						bind:value={notes}
						placeholder="Contoh: Pelunasan saat ambil banner di kasir"
						class="bg-muted/30 h-8 w-full rounded-md border border-border px-2.5 text-xs font-semibold text-foreground transition-colors placeholder:text-foreground-faint focus:border-primary focus:outline-none"
					/>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="flex items-center justify-end gap-2 border-t border-border/40 px-6 py-3.5">
				<Button
					variant="outline"
					size="sm"
					onclick={onClose}
					class="h-8.5 rounded-md text-xs font-semibold"
				>
					Batal
				</Button>
				<Button
					variant="default"
					size="sm"
					disabled={!paymentAmount || paymentAmount <= 0 || isSubmitting}
					onclick={handleSubmit}
					class="h-8.5 gap-1.5 rounded-md bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
				>
					{#if isSubmitting}
						<span>Memproses...</span>
					{:else}
						<IconCheckCircle2 class="size-3.5" />
						<span>Konfirmasi Pelunasan</span>
					{/if}
				</Button>
			</div>
		</div>
	</div>
{/if}
