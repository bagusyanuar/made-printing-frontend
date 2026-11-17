<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import type { Reseller } from '../../domain/reseller.entity';
	import { formatCurrency } from '../../domain/reseller.entity';

	interface Props {
		open: boolean;
		reseller: Reseller | null;
		onSave: (newLimit: number) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), reseller, onSave, onClose }: Props = $props();

	let creditLimit = $state<number>(0);
	let isSaving = $state(false);
	let validationError = $state<string | null>(null);

	const quickLimits = [5000000, 10000000, 15000000, 25000000, 50000000];

	$effect(() => {
		if (open && reseller) {
			creditLimit = reseller.creditLimit;
			validationError = null;
		}
	});

	async function handleSubmit() {
		if (!reseller) return;
		if (creditLimit < 0) {
			validationError = 'Limit kredit tidak boleh kurang dari 0';
			return;
		}

		isSaving = true;
		validationError = null;
		const success = await onSave(creditLimit);
		isSaving = false;

		if (success) {
			onClose();
		}
	}
</script>

{#if open && reseller}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="credit-limit-dialog-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog"
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 w-full max-w-lg rounded-xl border border-border bg-app-surface p-6 shadow-xl"
		>
			<!-- Header -->
			<div class="flex items-start gap-4">
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
				>
					<IconCreditCard class="size-5" />
				</div>
				<div class="flex-1">
					<Typography id="credit-limit-dialog-title" variant="h3" as="h2" class="font-bold text-foreground">
						Ubah Limit Kredit Reseller
					</Typography>
					<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle">
						{reseller.ownerName}
					</Typography>
				</div>
			</div>

			<!-- Current Credit & Outstanding Info -->
			<div class="mt-5 rounded-lg border border-border/80 bg-surface-subtle p-3.5">
				<div class="flex items-center justify-between text-xs text-foreground-subtle">
					<span>Limit Kredit Saat Ini</span>
					<span>Sisa Piutang Berjalan</span>
				</div>
				<div class="mt-1 flex items-center justify-between">
					<span class="text-base font-semibold text-foreground">
						{formatCurrency(reseller.creditLimit)}
					</span>
					<span
						class="text-base font-bold {reseller.usedCredit > reseller.creditLimit
							? 'text-rose-600 dark:text-rose-400'
							: reseller.usedCredit > 0
								? 'text-amber-600 dark:text-amber-400'
								: 'text-foreground'}"
					>
						{formatCurrency(reseller.usedCredit)}
					</span>
				</div>
			</div>

			<!-- Input Limit Kredit Baru -->
			<div class="mt-4 flex flex-col gap-2">
				<label for="new-credit-limit-input" class="text-xs font-medium text-foreground">
					Plafon Limit Kredit Baru (Rp)
				</label>
				<NumberField
					id="new-credit-limit-input"
					size="sm"
					thousandSeparator
					value={creditLimit}
					onValueChange={(val) => {
						creditLimit = val ?? 0;
					}}
					class="w-full font-semibold"
				/>

				<!-- Quick Chips -->
				<div class="mt-1 flex flex-wrap gap-1.5">
					{#each quickLimits as qLimit (qLimit)}
						<button
							type="button"
							onclick={() => (creditLimit = qLimit)}
							class="rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors {creditLimit ===
							qLimit
								? 'border-primary/50 bg-primary/10 font-semibold text-primary'
								: 'border-border/70 bg-surface-subtle text-foreground-subtle hover:border-primary/40 hover:bg-primary/5 hover:text-primary'}"
						>
							{formatCurrency(qLimit)}
						</button>
					{/each}
				</div>
			</div>

			<!-- Over Limit Warning Note -->
			{#if creditLimit < reseller.usedCredit}
				<div
					class="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-700 dark:text-rose-400"
				>
					<IconAlertTriangle class="size-4 shrink-0 mt-0.5" />
					<span>
						<strong>Perhatian:</strong> Limit baru lebih kecil dari sisa piutang berjalan ({formatCurrency(
							reseller.usedCredit
						)}). Sistem kasir akan otomatis menahan (Auto-Hold) penerbitan SPK baru untuk reseller ini hingga tagihan dilunasi.
					</span>
				</div>
			{/if}

			{#if validationError}
				<div class="mt-3 text-xs font-medium text-danger">
					{validationError}
				</div>
			{/if}

			<!-- Footer Buttons -->
			<div class="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
				<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSaving}>
					Batal
				</Button>
				<Button
					type="button"
					variant="default"
					size="sm"
					onclick={handleSubmit}
					isLoading={isSaving}
				>
					Simpan Limit Kredit
				</Button>
			</div>
		</div>
	</div>
{/if}
