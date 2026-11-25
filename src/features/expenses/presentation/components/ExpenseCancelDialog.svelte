<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import IconX from '~icons/lucide/x';
	import type { Expense } from '../../domain/expense.entity';
	import { formatCurrency } from '../../domain/expense.entity';

	interface Props {
		isOpen: boolean;
		expense: Expense | null;
		onConfirm: (reason: string) => Promise<boolean>;
	}

	let { isOpen = $bindable(false), expense = null, onConfirm }: Props = $props();

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
		aria-labelledby="expense-cancel-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-overlay backdrop-blur-xs transition-opacity"
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
						<Typography
							id="expense-cancel-title"
							variant="h4"
							as="h2"
							class="font-bold text-foreground"
						>
							Batalkan Pengeluaran
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							Catatan pengeluaran ini akan ditandai sebagai dibatalkan dan tidak dihitung di total.
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

			{#if expense}
				<div class="mt-4 rounded-lg border border-border/70 bg-surface-subtle p-3 text-xs">
					<div class="flex justify-between font-medium">
						<span class="text-foreground-subtle">No. Transaksi:</span>
						<span class="font-semibold text-primary">{expense.code}</span>
					</div>
					<div class="mt-1 flex justify-between">
						<span class="text-foreground-subtle">Rincian Item:</span>
						<span class="font-medium text-foreground">
							{expense.items[0]?.categoryName ?? '-'}
							{#if expense.items.length > 1}
								(+{expense.items.length - 1} item)
							{/if}
						</span>
					</div>
					<div class="mt-1 flex justify-between">
						<span class="text-foreground-subtle">Nominal:</span>
						<span class="font-bold text-rose-600 dark:text-rose-400">
							{formatCurrency(expense.amount)}
						</span>
					</div>
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="mt-4 space-y-3">
				<div>
					<label
						for="expense-cancel-reason"
						class="mb-1 block text-xs font-semibold text-foreground"
					>
						Alasan Pembatalan <span class="text-danger">*</span>
					</label>
					<textarea
						id="expense-cancel-reason"
						rows={3}
						bind:value={reason}
						placeholder="Contoh: Salah nominal input atau duplikasi nota pembelian..."
						class="w-full rounded-lg border border-border bg-app-surface px-3 py-2 text-xs text-foreground placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
						disabled={isSubmitting}></textarea>
					{#if errorMessage}
						<p class="mt-1 text-xs font-medium text-danger">{errorMessage}</p>
					{/if}
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<Button
						variant="outline"
						size="sm"
						onclick={() => (isOpen = false)}
						disabled={isSubmitting}
					>
						Tutup
					</Button>
					<Button
						variant="default"
						size="sm"
						type="submit"
						class="bg-danger text-white hover:bg-danger/90"
						isLoading={isSubmitting}
					>
						Batalkan Pengeluaran
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
