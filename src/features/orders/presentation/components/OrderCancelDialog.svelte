<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import IconX from '~icons/lucide/x';
	import type { Order } from '../../domain/order.entity';
	import { formatCurrency } from '../../domain/order.entity';

	let {
		isOpen = $bindable(false),
		order = null,
		onConfirm
	}: {
		isOpen: boolean;
		order: Order | null;
		onConfirm: (reason: string) => Promise<boolean>;
	} = $props();

	let reason = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	$effect(() => {
		if (isOpen) {
			reason = '';
			errorMessage = null;
			isSubmitting = false;
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!reason.trim() || reason.trim().length < 3) {
			errorMessage = 'Alasan pembatalan minimal 3 karakter';
			return;
		}

		isSubmitting = true;
		errorMessage = null;

		const success = await onConfirm(reason.trim());
		isSubmitting = false;

		if (success) {
			isOpen = false;
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
			onclick={() => (isOpen = false)}
			aria-label="Tutup dialog"
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 w-full max-w-md rounded-xl border border-border bg-app-surface p-5 shadow-2xl"
		>
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger"
					>
						<IconAlertTriangle class="size-5" />
					</div>
					<div>
						<Typography variant="h4" as="h2" class="font-bold text-foreground">
							Batalkan Pesanan
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							Nota pesanan ini akan dibatalkan dan dipindahkan ke tab Selesai / Arsip.
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (isOpen = false)}
					class="cursor-pointer rounded-lg p-1 text-foreground-subtle hover:bg-surface-subtle hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			{#if order}
				<div class="mt-4 rounded-lg border border-border/70 bg-surface-subtle p-3 text-xs">
					<div class="flex justify-between font-medium">
						<span class="text-foreground-subtle">No. Invoice:</span>
						<span class="font-semibold text-primary">{order.invoiceNumber}</span>
					</div>
					<div class="mt-1 flex justify-between">
						<span class="text-foreground-subtle">Pelanggan:</span>
						<span class="font-semibold text-foreground">{order.customerName}</span>
					</div>
					<div class="mt-1 flex justify-between">
						<span class="text-foreground-subtle">Total Tagihan:</span>
						<span class="font-semibold text-foreground">Rp {formatCurrency(order.subtotal)}</span>
					</div>
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="mt-4 flex flex-col gap-3">
				<div>
					<label for="order-cancel-reason" class="mb-1 block text-xs font-medium text-foreground">
						Alasan Pembatalan <span class="text-danger">*</span>
					</label>
					<textarea
						id="order-cancel-reason"
						bind:value={reason}
						rows={3}
						placeholder="Contoh: Permintaan pembatalan dari pelanggan, duplikasi nota..."
						class="w-full rounded-md border border-border bg-canvas p-2.5 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
					></textarea>
					{#if errorMessage}
						<p class="mt-1 text-[11px] text-danger">{errorMessage}</p>
					{/if}
				</div>

				<div class="mt-2 flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (isOpen = false)}
						disabled={isSubmitting}
					>
						Tutup
					</Button>
					<Button
						type="submit"
						variant="default"
						size="sm"
						class="bg-danger text-white hover:bg-danger/90"
						disabled={isSubmitting || reason.trim().length < 3}
					>
						{isSubmitting ? 'Membatalkan...' : 'Batalkan Pesanan'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
