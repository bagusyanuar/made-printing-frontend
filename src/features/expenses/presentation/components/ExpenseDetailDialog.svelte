<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconWallet from '~icons/lucide/wallet';
	import IconX from '~icons/lucide/x';
	import IconCalendar from '~icons/lucide/calendar';
	import IconBuilding2 from '~icons/lucide/building-2';
	import IconLandmark from '~icons/lucide/landmark';
	import IconUser from '~icons/lucide/user';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconBan from '~icons/lucide/ban';
	import IconLayers from '~icons/lucide/layers';
	import IconCreditCard from '~icons/lucide/credit-card';
	import type { Expense, ExpenseReceiptGroup } from '../../domain/expense.entity';
	import { formatCurrency, formatExpenseDateTime } from '../../domain/expense.entity';
	import ExpenseStatusChip from './ExpenseStatusChip.svelte';
	import ExpensePaymentChip from './ExpensePaymentChip.svelte';

	interface Props {
		open: boolean;
		expense: Expense | null;
		onClose: () => void;
		onOpenPayment?: (expense: Expense) => void;
		onApprove?: (expense: Expense) => void;
		onCancel?: (expense: Expense) => void;
	}

	let { open, expense, onClose, onOpenPayment, onApprove, onCancel }: Props = $props();

	function getGroupMeta(group: ExpenseReceiptGroup): { label: string; className: string } {
		switch (group) {
			case 'production':
				return {
					label: 'Produksi (HPP)',
					className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
				};
			case 'operational':
				return {
					label: 'Operasional (OPEX)',
					className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
				};
			case 'mixed':
				return {
					label: 'Campuran (Produksi & Operasional)',
					className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
				};
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
		if (open && e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open && expense}
	{@const groupMeta = getGroupMeta(expense.group)}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="expense-detail-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-overlay backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog rincian pengeluaran"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-border/50 px-6 py-4">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconWallet class="size-5" />
					</div>
					<div class="flex flex-col">
						<div class="flex flex-wrap items-center gap-2">
							<Typography
								id="expense-detail-title"
								variant="h4"
								as="h2"
								class="text-sm font-bold text-foreground"
							>
								{expense.code}
							</Typography>
							<ExpenseStatusChip status={expense.status} />
							<ExpensePaymentChip status={expense.paymentStatus} />
						</div>
						<Typography variant="small" as="span" class="text-xs text-foreground-subtle">
							{expense.items.length} Pos Item • {formatExpenseDateTime(expense.expenseDate)}
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="focus-visible:ring-focus-ring cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-surface-subtle hover:text-foreground focus-visible:ring-2 focus-visible:outline-hidden"
					aria-label="Tutup modal"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
				{#if expense.status === 'CANCELLED'}
					<div class="rounded-lg border border-rose-500/25 bg-rose-500/10 p-3">
						<div class="flex items-center justify-between gap-2">
							<span class="text-xs font-bold text-rose-700 dark:text-rose-300">
								Pengeluaran Dibatalkan
							</span>
							{#if expense.cancelledAt}
								<span class="text-[11px] text-foreground-subtle">
									{formatExpenseDateTime(expense.cancelledAt)}
								</span>
							{/if}
						</div>
						{#if expense.cancelReason}
							<p class="mt-1.5 text-xs text-foreground">
								Alasan: {expense.cancelReason}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Metadata Grid -->
				<div class="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
					<div class="flex items-start gap-2">
						<IconLandmark class="mt-0.5 size-4 shrink-0 text-foreground-subtle" />
						<div class="flex flex-col gap-0.5">
							<span class="text-[11px] text-foreground-subtle">Sumber Dana</span>
							{#if expense.paymentLines.length > 1}
								<span class="font-semibold text-foreground">
									Split ({expense.paymentLines.length} Sumber Dana)
								</span>
								<div class="mt-0.5 space-y-0.5 text-[11px] text-foreground-subtle">
									{#each expense.paymentLines as line (line.accountName)}
										<div>{line.accountName}: {formatCurrency(line.amount)}</div>
									{/each}
								</div>
							{:else}
								<span class="font-semibold text-foreground">{expense.accountName}</span>
							{/if}
						</div>
					</div>

					<div class="flex items-start gap-2">
						<IconBuilding2 class="mt-0.5 size-4 shrink-0 text-foreground-subtle" />
						<div class="flex flex-col gap-0.5">
							<span class="text-[11px] text-foreground-subtle">Vendor / Penerima</span>
							<div class="flex flex-wrap items-center gap-1.5">
								<span class="font-semibold text-foreground">{expense.vendorName || '-'}</span>
								{#if expense.vendorId}
									<span
										class="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary"
									>
										Supplier
									</span>
								{/if}
							</div>
							<span
								class="mt-0.5 w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold {groupMeta.className}"
							>
								{groupMeta.label}
							</span>
						</div>
					</div>

					<div class="flex items-start gap-2">
						<IconCalendar class="mt-0.5 size-4 shrink-0 text-foreground-subtle" />
						<div class="flex flex-col gap-0.5">
							<span class="text-[11px] text-foreground-subtle">No. Referensi / Nota</span>
							<span class="font-semibold text-foreground">{expense.referenceNumber || '-'}</span>
						</div>
					</div>

					<div class="flex items-start gap-2">
						<IconUser class="mt-0.5 size-4 shrink-0 text-foreground-subtle" />
						<div class="flex flex-col gap-0.5">
							<span class="text-[11px] text-foreground-subtle">Dicatat Oleh</span>
							<span class="font-semibold text-foreground">{expense.recordedBy}</span>
							{#if expense.approvedBy}
								<span class="text-[11px] text-foreground-subtle">
									Disetujui: {expense.approvedBy}
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Items Breakdown List -->
				<div class="overflow-hidden rounded-lg border border-border">
					<div
						class="flex items-center justify-between border-b border-border/70 bg-surface-subtle/60 px-4 py-2.5"
					>
						<div class="flex items-center gap-1.5 font-bold text-foreground">
							<IconLayers class="size-3.5 text-primary" />
							<span>Rincian Item Pengeluaran ({expense.items.length})</span>
						</div>
						<span class="text-[11px] font-semibold text-foreground-subtle">Nominal</span>
					</div>

					<div class="divide-y divide-border/50">
						{#each expense.items as item, idx (item.id)}
							<div class="flex items-start justify-between gap-4 px-4 py-3">
								<div class="min-w-0 flex-1 space-y-1">
									<div class="flex flex-wrap items-center gap-1.5">
										<span class="text-[10px] font-semibold text-foreground-subtle">
											#{idx + 1}
										</span>
										<span
											class="rounded px-1.5 py-0.5 text-[9px] font-bold {item.group === 'production'
												? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
												: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'}"
										>
											{item.group === 'production' ? 'Produksi' : 'Operasional'}
										</span>
										<span class="font-semibold text-foreground">{item.categoryName}</span>
										{#if item.productCategoryName}
											<span class="text-[11px] text-foreground-subtle">
												({item.productCategoryName})
											</span>
										{/if}
									</div>
									<p class="text-xs font-medium text-foreground">{item.description}</p>
									{#if item.notes}
										<p class="text-[11px] text-foreground-subtle">{item.notes}</p>
									{/if}
								</div>
								<span class="shrink-0 font-bold text-foreground">
									{formatCurrency(item.amount)}
								</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Payment History Log -->
				<div class="space-y-1.5">
					<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
						Riwayat Pembayaran ({expense.paymentHistory.length})
					</span>
					{#if expense.paymentHistory.length === 0}
						<div
							class="bg-muted/10 rounded-lg border border-border/60 p-3 text-center text-foreground-subtle"
						>
							Belum ada pembayaran yang tercatat (Tempo / Hutang Usaha).
						</div>
					{:else}
						<div class="divide-y divide-border/40 rounded-lg border border-border bg-app-surface">
							{#each expense.paymentHistory as pay (pay.id)}
								<div class="flex items-center justify-between p-3 text-xs">
									<div class="flex items-center gap-2.5">
										<div
											class="bg-muted/30 flex size-7 items-center justify-center rounded-md border border-border text-foreground-subtle"
										>
											<IconCreditCard class="size-3.5" />
										</div>
										<div class="flex flex-col">
											<div class="flex items-center gap-2">
												<span class="font-bold text-foreground">Sumber: {pay.accountName}</span>
												{#if pay.referenceNumber && pay.referenceNumber !== '-'}
													<span class="text-[10px] text-foreground-subtle">
														({pay.referenceNumber})
													</span>
												{/if}
											</div>
											<span class="text-[10px] text-foreground-subtle">
												{formatExpenseDateTime(pay.paymentDate)} • {pay.note || '-'}
											</span>
										</div>
									</div>
									<span class="font-bold text-emerald-600 dark:text-emerald-400">
										{formatCurrency(pay.amount)}
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Financial Summary Card (mirrors OrderDetailDialog) -->
				<div class="bg-muted/20 space-y-2 rounded-lg border border-border p-4">
					<div class="flex items-center justify-between text-xs text-foreground-subtle">
						<span>Subtotal Item:</span>
						<span class="font-semibold text-foreground">{formatCurrency(expense.subtotal)}</span>
					</div>
					{#if expense.discountAmount > 0}
						<div class="flex items-center justify-between text-xs text-foreground-subtle">
							<span>Potongan / Diskon:</span>
							<span class="font-semibold text-emerald-600 dark:text-emerald-400">
								- {formatCurrency(expense.discountAmount)}
							</span>
						</div>
					{/if}
					<div class="flex items-center justify-between text-xs text-foreground-subtle">
						<span>Total Akhir Nota:</span>
						<span class="font-bold text-foreground">{formatCurrency(expense.amount)}</span>
					</div>
					<div class="flex items-center justify-between text-xs text-foreground-subtle">
						<span>Total Telah Dibayar:</span>
						<span class="font-bold text-emerald-600 dark:text-emerald-400">
							{formatCurrency(expense.totalPaid)}
						</span>
					</div>
					<div
						class="flex items-center justify-between border-t border-border/60 pt-2 text-sm font-bold"
					>
						<span class="text-foreground">Sisa Hutang Usaha:</span>
						<span
							class={expense.remainingAmount > 0
								? 'font-bold text-rose-600 dark:text-rose-400'
								: 'font-bold text-emerald-600 dark:text-emerald-400'}
						>
							{formatCurrency(expense.remainingAmount)}
						</span>
					</div>
				</div>

				{#if expense.notes}
					<div class="rounded-lg border border-border/70 bg-surface-subtle/40 p-3">
						<span class="text-[11px] font-semibold text-foreground-subtle">Catatan Nota</span>
						<p class="mt-0.5 text-xs text-foreground">{expense.notes}</p>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div
				class="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-6 py-3.5"
			>
				<div class="flex items-center gap-2">
					{#if expense.status === 'PENDING' && onApprove}
						<Button
							variant="default"
							size="sm"
							onclick={() => {
								onApprove(expense);
								onClose();
							}}
							class="gap-1.5"
						>
							<IconCheckCircle2 class="size-3.5" />
							<span>Setujui Pengeluaran</span>
						</Button>
					{/if}
					{#if expense.status !== 'CANCELLED' && onCancel}
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								onClose();
								onCancel(expense);
							}}
							class="gap-1.5 border-danger/30 text-danger hover:bg-danger/10"
						>
							<IconBan class="size-3.5" />
							<span>Batalkan</span>
						</Button>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					{#if expense.remainingAmount > 0 && expense.status !== 'CANCELLED' && onOpenPayment}
						<Button
							variant="default"
							size="sm"
							onclick={() => {
								onClose();
								onOpenPayment(expense);
							}}
							class="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
						>
							<IconCreditCard class="size-3.5" />
							<span>Pelunasan Hutang</span>
						</Button>
					{/if}
					<Button variant="outline" size="sm" onclick={onClose}>Tutup</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
