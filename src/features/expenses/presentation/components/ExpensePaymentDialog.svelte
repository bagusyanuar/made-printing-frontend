<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { toast } from 'dystopia-linear-lib/components/toast';
	import IconWallet from '~icons/lucide/wallet';
	import IconBanknote from '~icons/lucide/banknote';
	import IconLandmark from '~icons/lucide/landmark';
	import IconX from '~icons/lucide/x';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import {
		EXPENSE_ACCOUNTS,
		formatCurrency,
		type Expense,
		type ExpenseAccountName
	} from '../../domain/expense.entity';
	import { expenseStore } from '../../application/expense.store.svelte';

	interface Props {
		open: boolean;
		expense: Expense | null;
		onClose: () => void;
		onSuccess?: () => void;
	}

	let { open, expense, onClose, onSuccess }: Props = $props();

	let paymentAmount = $state<number | undefined>(undefined);
	let accountName = $state<ExpenseAccountName>('Transfer');
	let referenceNumber = $state('-');
	let note = $state('');
	let isSubmitting = $state(false);

	$effect(() => {
		if (open && expense) {
			paymentAmount = expense.remainingAmount;
			accountName = 'Transfer';
			referenceNumber = '-';
			note = 'Pelunasan hutang usaha nota pengeluaran';
			isSubmitting = false;
		}
	});

	function setFullAmount() {
		if (expense) {
			paymentAmount = expense.remainingAmount;
		}
	}

	function getAccountVisual(account: ExpenseAccountName) {
		switch (account) {
			case 'Kas Kecil':
				return {
					icon: IconWallet,
					activeClass:
						'border-amber-500/50 bg-amber-500/10 font-bold text-amber-700 dark:text-amber-300',
					iconClass: 'text-amber-600 dark:text-amber-400'
				};
			case 'Kas Besar':
				return {
					icon: IconBanknote,
					activeClass:
						'border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300',
					iconClass: 'text-emerald-600 dark:text-emerald-400'
				};
			case 'Transfer':
				return {
					icon: IconLandmark,
					activeClass: 'border-sky-500/50 bg-sky-500/10 font-bold text-sky-700 dark:text-sky-300',
					iconClass: 'text-sky-600 dark:text-sky-400'
				};
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!expense || !paymentAmount || paymentAmount <= 0 || isSubmitting) return;
		if (paymentAmount > expense.remainingAmount) {
			toast.danger('Nominal Melebihi Sisa Hutang', {
				description: `Maksimal pelunasan adalah ${formatCurrency(expense.remainingAmount)}.`
			});
			return;
		}

		isSubmitting = true;
		const success = await expenseStore.settlePayment(expense.id, {
			amount: paymentAmount,
			accountName,
			referenceNumber: referenceNumber.trim() || '-',
			note: note.trim() || undefined
		});
		isSubmitting = false;

		if (success) {
			toast.success('Pelunasan Hutang Dicatat', {
				description: `Pembayaran sebesar ${formatCurrency(paymentAmount)} melalui ${accountName} untuk ${expense.code} berhasil disimpan.`
			});
			onClose();
			onSuccess?.();
		} else {
			toast.danger('Gagal Memproses Pelunasan', {
				description: expenseStore.error || 'Terjadi kesalahan sistem saat mencatat pelunasan.'
			});
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

	function handleWindowKeydown(e: KeyboardEvent) {
		if (open && e.key === 'Escape' && !isSubmitting) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open && expense}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="expense-payment-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-overlay backdrop-blur-xs transition-opacity"
			onclick={() => !isSubmitting && onClose()}
			aria-label="Tutup dialog pelunasan"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-border/50 px-6 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
					>
						<IconCheckCircle2 class="size-5" />
					</div>
					<div class="flex flex-col">
						<Typography
							id="expense-payment-title"
							variant="h4"
							as="h2"
							class="text-sm font-bold text-foreground"
						>
							Pelunasan Hutang Usaha
						</Typography>
						<Typography variant="small" as="span" class="text-xs text-foreground-subtle">
							{expense.code} • {expense.vendorName || 'Tanpa Nama Vendor'}
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={() => !isSubmitting && onClose()}
					class="focus-visible:ring-focus-ring cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-surface-subtle hover:text-foreground focus-visible:ring-2 focus-visible:outline-hidden"
					aria-label="Tutup modal"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Body -->
			<form
				id="expense-settle-form"
				onsubmit={handleSubmit}
				class="flex-1 space-y-4 overflow-y-auto p-6 text-xs"
			>
				<!-- Outstanding Debt Card -->
				<div
					class="bg-muted/20 flex items-center justify-between rounded-lg border border-border p-3.5"
				>
					<div class="flex flex-col gap-0.5">
						<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
							Sisa Hutang Usaha
						</span>
						<span class="text-base font-bold text-rose-600 dark:text-rose-400">
							{formatCurrency(expense.remainingAmount)}
						</span>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={setFullAmount}
						class="h-7 rounded-md px-2.5 text-[11px] font-semibold"
					>
						Lunasi Penuh
					</Button>
				</div>

				<!-- Amount Input -->
				<div class="flex flex-col gap-1.5">
					<label
						for="expense-settle-amount"
						class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
					>
						Nominal Pembayaran <span class="text-danger">*</span>
					</label>
					<NumberField
						id="expense-settle-amount"
						size="sm"
						value={paymentAmount}
						onValueChange={(val) => (paymentAmount = val)}
						min={100}
						max={expense.remainingAmount}
						thousandSeparator={true}
						classes={{ input: 'text-right font-bold tabular-nums' }}
						class="w-full text-sm font-bold"
					>
						{#snippet prefix()}
							<span class="text-xs font-bold text-foreground-subtle">Rp</span>
						{/snippet}
					</NumberField>
				</div>

				<!-- Funding Source -->
				<div class="flex flex-col gap-1.5">
					<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
						Sumber Dana <span class="text-danger">*</span>
					</span>
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
						{#each EXPENSE_ACCOUNTS as account (account)}
							{@const visual = getAccountVisual(account)}
							{@const AccountIcon = visual.icon}
							<button
								type="button"
								onclick={() => (accountName = account)}
								disabled={isSubmitting}
								class="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 text-center transition-all {accountName ===
								account
									? visual.activeClass
									: 'hover:bg-muted/40 border-border/80 bg-app-surface text-foreground-subtle hover:text-foreground'}"
							>
								<AccountIcon class="size-4 shrink-0 {visual.iconClass}" />
								<span class="text-xs font-semibold">{account}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Reference & Note -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div class="flex flex-col gap-1.5">
						<label
							for="expense-settle-ref"
							class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
						>
							No. Referensi / Bukti
						</label>
						<TextField
							id="expense-settle-ref"
							size="sm"
							placeholder="-"
							value={referenceNumber}
							onValueChange={(val) => (referenceNumber = val)}
							class="w-full"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<label
							for="expense-settle-note"
							class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
						>
							Catatan Pelunasan
						</label>
						<TextField
							id="expense-settle-note"
							size="sm"
							placeholder="Opsional..."
							value={note}
							onValueChange={(val) => (note = val)}
							class="w-full"
						/>
					</div>
				</div>
			</form>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border/50 px-6 py-3.5">
				<Button type="button" variant="outline" size="sm" onclick={onClose} disabled={isSubmitting}>
					Batal
				</Button>
				<Button
					type="submit"
					form="expense-settle-form"
					variant="default"
					size="sm"
					isLoading={isSubmitting}
					disabled={!paymentAmount || paymentAmount <= 0 || paymentAmount > expense.remainingAmount}
					class="gap-1.5"
				>
					<IconCheckCircle2 class="size-3.5" />
					<span>Simpan Pelunasan</span>
				</Button>
			</div>
		</div>
	</div>
{/if}
