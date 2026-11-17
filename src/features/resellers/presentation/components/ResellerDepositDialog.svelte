<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import IconWallet from '~icons/lucide/wallet';
	import IconPlus from '~icons/lucide/plus';
	import IconMinus from '~icons/lucide/minus';
	import type { Reseller } from '../../domain/reseller.entity';
	import { formatCurrency } from '../../domain/reseller.entity';

	interface Props {
		open: boolean;
		reseller: Reseller | null;
		onSave: (amount: number, note?: string) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), reseller, onSave, onClose }: Props = $props();

	let mode = $state<'add' | 'deduct'>('add');
	let amount = $state<number>(500000);
	let note = $state('');
	let isSaving = $state(false);
	let validationError = $state<string | null>(null);

	const quickAmounts = [250000, 500000, 1000000, 2500000, 5000000];

	const calculatedNewBalance = $derived.by(() => {
		if (!reseller) return 0;
		const delta = mode === 'add' ? (amount || 0) : -(amount || 0);
		return Math.max(0, reseller.depositBalance + delta);
	});

	$effect(() => {
		if (open) {
			mode = 'add';
			amount = 500000;
			note = '';
			validationError = null;
		}
	});

	async function handleSubmit() {
		if (!reseller) return;
		if (!amount || amount <= 0) {
			validationError = 'Nominal saldo harus lebih besar dari 0';
			return;
		}

		if (mode === 'deduct' && amount > reseller.depositBalance) {
			validationError = 'Pengurangan melebihi saldo deposit yang tersedia';
			return;
		}

		isSaving = true;
		validationError = null;
		const finalAmount = mode === 'add' ? amount : -amount;
		const success = await onSave(finalAmount, note.trim() || undefined);
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
			<div class="flex items-start gap-4">
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
				>
					<IconWallet class="size-5" />
				</div>
				<div class="flex-1">
					<Typography variant="h3" as="h2" class="font-bold text-foreground">
						Kelola Saldo Deposit Mitra
					</Typography>
					<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle">
						{reseller.name} ({reseller.code})
					</Typography>
				</div>
			</div>

			<!-- Current Balance Banner -->
			<div class="mt-5 rounded-lg border border-border/80 bg-surface-subtle p-3.5">
				<div class="flex items-center justify-between text-xs text-foreground-subtle">
					<span>Saldo Deposit Saat Ini</span>
					<span>Estimasi Saldo Akhir</span>
				</div>
				<div class="mt-1 flex items-center justify-between">
					<span class="text-base font-semibold text-foreground">
						{formatCurrency(reseller.depositBalance)}
					</span>
					<span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
						{formatCurrency(calculatedNewBalance)}
					</span>
				</div>
			</div>

			<!-- Action Mode Switch -->
			<div class="mt-4 flex gap-2">
				<button
					type="button"
					onclick={() => (mode = 'add')}
					class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all {mode ===
					'add'
						? 'border-primary/40 bg-primary/10 text-primary shadow-2xs'
						: 'border-border bg-surface text-foreground-subtle hover:bg-surface-subtle'}"
				>
					<IconPlus class="size-3.5" />
					<span>Top-Up Saldo</span>
				</button>
				<button
					type="button"
					onclick={() => (mode = 'deduct')}
					class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all {mode ===
					'deduct'
						? 'border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-2xs dark:text-amber-400'
						: 'border-border bg-surface text-foreground-subtle hover:bg-surface-subtle'}"
				>
					<IconMinus class="size-3.5" />
					<span>Koreksi / Tarik Saldo</span>
				</button>
			</div>

			<!-- Amount Input & Quick Chips -->
			<div class="mt-4 flex flex-col gap-2">
				<label for="deposit-amount-input" class="text-xs font-medium text-foreground">
					Nominal {mode === 'add' ? 'Top-Up' : 'Pengurangan'} (Rp)
				</label>
				<NumberField
					id="deposit-amount-input"
					size="sm"
					min={0}
					step={50000}
					value={amount}
					onValueChange={(val) => {
						amount = val ?? 0;
					}}
					class="w-full"
				/>

				<!-- Quick Chips -->
				<div class="mt-1 flex flex-wrap gap-1.5">
					{#each quickAmounts as qAmount (qAmount)}
						<button
							type="button"
							onclick={() => (amount = qAmount)}
							class="rounded-md border border-border/70 bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-foreground-subtle transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
						>
							+{formatCurrency(qAmount)}
						</button>
					{/each}
				</div>
			</div>

			<!-- Notes / Reference -->
			<div class="mt-4 flex flex-col gap-2">
				<label for="deposit-note-input" class="text-xs font-medium text-foreground">
					Catatan Transaksi / Referensi Kasir (Opsional)
				</label>
				<TextField
					id="deposit-note-input"
					size="sm"
					placeholder="Contoh: Transfer Bank BCA / Setoran tunai kasir"
					value={note}
					onValueChange={(val) => (note = val)}
					class="w-full"
				/>
			</div>

			{#if validationError}
				<div class="mt-3 text-xs font-medium text-danger">
					{validationError}
				</div>
			{/if}

			<!-- Modal Footer -->
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
					{mode === 'add' ? 'Konfirmasi Top-Up' : 'Simpan Penyesuaian'}
				</Button>
			</div>
		</div>
	</div>
{/if}
