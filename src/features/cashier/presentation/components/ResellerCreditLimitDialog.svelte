<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cashierStore } from '../../application/cashier.store.svelte';
	import { formatCurrency } from '../../domain/cashier.entity';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconShieldAlert from '~icons/lucide/shield-alert';
	import IconShieldCheck from '~icons/lucide/shield-check';
	import IconHandshake from '~icons/lucide/handshake';
	import IconX from '~icons/lucide/x';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let activeOrder = $derived(cashierStore.activeOrder);

	// Reseller Credit stats (simulated based on active reseller profile)
	let creditLimit = $state(5000000); // Plafon 5 Juta
	let usedCredit = $state(1250000); // Hutang Berjalan 1.25 Juta
	let remainingCredit = $derived(creditLimit - usedCredit);
	let currentOrderAmount = $derived(cashierStore.grandTotal);
	let afterOrderRemaining = $derived(remainingCredit - currentOrderAmount);
	let isOverlimit = $derived(afterOrderRemaining < 0);

	// Progress bar utilization percentages
	let usedPercent = $derived(Math.min(100, Math.round((usedCredit / creditLimit) * 100)));
	let orderPercent = $derived(
		Math.min(100 - usedPercent, Math.round((currentOrderAmount / creditLimit) * 100))
	);
	let remainingPercent = $derived(Math.max(0, 100 - usedPercent - orderPercent));

	function modalSlideIn(node: Element, { duration = 220 } = {}) {
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
			class="fixed inset-0 cursor-pointer bg-black/50 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Dialog Container with Smooth Slide-in Animation -->
		<div
			class="relative z-10 flex w-full max-w-md flex-col rounded-xl border border-border bg-app-surface p-5 shadow-2xl"
			transition:modalSlideIn={{ duration: 220 }}
		>
			<!-- Header (No divider line) -->
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg {isOverlimit
							? 'border border-rose-500/20 bg-rose-500/10 text-rose-500'
							: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-500'}"
					>
						{#if isOverlimit}
							<IconShieldAlert class="size-5" />
						{:else}
							<IconShieldCheck class="size-5" />
						{/if}
					</div>
					<div class="flex flex-col">
						<div class="flex items-center gap-2">
							<span class="text-sm font-bold text-foreground">Status Plafon Reseller</span>
							<span
								class="inline-flex items-center gap-1 rounded border border-indigo-500/25 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"
							>
								<IconHandshake class="size-3" />
								<span>RESELLER</span>
							</span>
						</div>
						<span class="text-xs font-semibold text-foreground-subtle">
							{activeOrder?.customerName || 'Reseller'}
							{#if activeOrder?.customerPhone && activeOrder.customerPhone !== '-'}
								<span class="text-foreground-faint">• {activeOrder.customerPhone}</span>
							{/if}
						</span>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="hover:bg-muted cursor-pointer rounded-md p-1.5 text-foreground-subtle transition-colors hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Visual Credit Utilization Meter -->
			<div class="bg-muted/20 mt-4 flex flex-col gap-2 rounded-lg border border-border/70 p-3.5">
				<div class="flex items-center justify-between text-xs">
					<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
						Kapasitas Kredit
					</span>
					<span class="font-bold text-foreground">
						{usedPercent + orderPercent}% Terpakai
					</span>
				</div>

				<!-- Multi-segment Progress Bar -->
				<div class="bg-muted/60 flex h-2.5 w-full overflow-hidden rounded-full">
					{#if usedPercent > 0}
						<div
							style="width: {usedPercent}%"
							class="bg-rose-500 transition-all duration-300"
							title="Hutang Berjalan: {usedPercent}%"
						></div>
					{/if}
					{#if orderPercent > 0}
						<div
							style="width: {orderPercent}%"
							class="bg-primary transition-all duration-300"
							title="Order Ini: {orderPercent}%"
						></div>
					{/if}
					{#if remainingPercent > 0}
						<div
							style="width: {remainingPercent}%"
							class="bg-emerald-500/70 transition-all duration-300"
							title="Sisa Plafon: {remainingPercent}%"
						></div>
					{/if}
				</div>

				<!-- Legend -->
				<div class="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-foreground-subtle">
					<div class="flex items-center gap-1.5">
						<span class="size-2 rounded-full bg-rose-500"></span>
						<span>Hutang: <strong>{usedPercent}%</strong></span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="size-2 rounded-full bg-primary"></span>
						<span>Order Ini: <strong>{orderPercent}%</strong></span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="size-2 rounded-full bg-emerald-500/70"></span>
						<span>Tersedia: <strong>{remainingPercent}%</strong></span>
					</div>
				</div>
			</div>

			<!-- Modern 3-Column KPI Stat Blocks -->
			<div class="mt-3 grid grid-cols-3 gap-2">
				<!-- 1. Total Plafon -->
				<div class="flex flex-col gap-0.5 rounded-lg border border-border/70 bg-card p-2.5">
					<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
						Total Plafon
					</span>
					<span class="truncate text-xs font-bold text-foreground">
						{formatCurrency(creditLimit)}
					</span>
				</div>

				<!-- 2. Hutang Berjalan -->
				<div class="flex flex-col gap-0.5 rounded-lg border border-rose-500/25 bg-rose-500/4 p-2.5">
					<span
						class="text-[10px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400"
					>
						Hutang Berjalan
					</span>
					<span class="truncate text-xs font-bold text-rose-600 dark:text-rose-400">
						{formatCurrency(usedCredit)}
					</span>
				</div>

				<!-- 3. Sisa Plafon Saat Ini -->
				<div class="flex flex-col gap-0.5 rounded-lg border border-border/70 bg-card p-2.5">
					<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
						Sisa Plafon
					</span>
					<span class="truncate text-xs font-bold text-foreground">
						{formatCurrency(remainingCredit)}
					</span>
				</div>
			</div>

			<!-- Active Order Impact Simulation Card -->
			<div class="bg-muted/20 mt-3 flex flex-col gap-2 rounded-lg border border-border/80 p-3">
				<div class="flex items-center justify-between text-xs">
					<span class="text-foreground-subtle">Nominal Order Ini:</span>
					<span class="font-bold text-primary">{formatCurrency(currentOrderAmount)}</span>
				</div>
				<div class="border-t border-border/40"></div>
				<div class="flex items-center justify-between">
					<div class="flex flex-col">
						<span class="text-xs font-bold text-foreground">Estimasi Sisa Plafon Akhir:</span>
						<span class="text-[10px] text-foreground-subtle">Jika diproses sebagai piutang</span>
					</div>
					<span
						class="text-sm font-black {isOverlimit
							? 'text-rose-600 dark:text-rose-400'
							: 'text-emerald-600 dark:text-emerald-400'}"
					>
						{formatCurrency(afterOrderRemaining)}
					</span>
				</div>
			</div>

			<!-- Status Callout Banner -->
			<div class="mt-3">
				{#if isOverlimit}
					<div
						class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300"
					>
						<div class="font-bold">Peringatan Overlimit Kredit</div>
						<p class="mt-0.5 text-[11px] leading-relaxed text-rose-600 dark:text-rose-400">
							Transaksi ini melebihi sisa plafon kredit reseller ({formatCurrency(
								remainingCredit
							)}). Diperlukan persetujuan manajer atau pembayaran uang muka (DP) tunai.
						</p>
					</div>
				{:else}
					<div
						class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
					>
						<div class="font-bold">Plafon Kredit Aman</div>
						<p class="mt-0.5 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
							Transaksi tempo (piutang) diizinkan dan berada di dalam batas limit kredit reseller.
						</p>
					</div>
				{/if}
			</div>

			<!-- Footer (No divider line) -->
			<div class="mt-4 flex items-center justify-end">
				<Button
					variant="outline"
					size="sm"
					onclick={onClose}
					class="h-8 cursor-pointer rounded-md text-xs font-bold"
				>
					Tutup
				</Button>
			</div>
		</div>
	</div>
{/if}
