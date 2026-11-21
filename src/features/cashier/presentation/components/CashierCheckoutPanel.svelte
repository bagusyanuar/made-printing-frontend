<script lang="ts">
	import { cashierStore } from '../../application/cashier.store.svelte';
	import { formatCurrency, formatCashierDateTime } from '../../domain/cashier.entity';
	import type { CashierPaymentMethod } from '../../domain/cashier.entity';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Switch } from 'dystopia-linear-lib/components/switch';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import { Card } from 'dystopia-linear-lib/components/card';
	import { Tooltip } from 'dystopia-linear-lib/components/tooltip';
	import IconReceipt from '~icons/lucide/receipt';
	import IconPalette from '~icons/lucide/palette';
	import IconPlus from '~icons/lucide/plus';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconScissors from '~icons/lucide/scissors';
	import IconCornerUpLeft from '~icons/lucide/corner-up-left';
	import IconBanknote from '~icons/lucide/banknote';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconQrCode from '~icons/lucide/qr-code';
	import IconClock from '~icons/lucide/clock';
	import IconPrinter from '~icons/lucide/printer';
	import IconCheck from '~icons/lucide/check';
	import IconLayers from '~icons/lucide/layers';
	import IconInfo from '~icons/lucide/info';
	import IconHandshake from '~icons/lucide/handshake';
	import IconCircleAlert from '~icons/lucide/circle-alert';
	import IconCircleCheck from '~icons/lucide/circle-check';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconHandCoins from '~icons/lucide/hand-coins';
	import IconFileText from '~icons/lucide/file-text';

	interface Props {
		onOpenAddRetail: () => void;
		onOpenSplitRetailBatch: () => void;
		onOpenDraftConfirm: () => void;
		onOpenCancelConfirm: () => void;
		onOpenMergeTicket: () => void;
		onOpenCreditLimit: () => void;
	}

	let {
		onOpenAddRetail,
		onOpenSplitRetailBatch,
		onOpenDraftConfirm,
		onOpenCancelConfirm,
		onOpenMergeTicket,
		onOpenCreditLimit
	}: Props = $props();

	let activeOrder = $derived(cashierStore.activeOrder);
	let hasRetailItems = $derived(Boolean(activeOrder?.items.some((i) => !i.isProduction)));
	let retailItemsCount = $derived(activeOrder?.items.filter((i) => !i.isProduction).length ?? 0);
	let isProcessing = $state(false);

	async function handlePay() {
		isProcessing = true;
		try {
			cashierStore.isTemporaryReceipt = false;
			await cashierStore.processPayment();
		} finally {
			isProcessing = false;
		}
	}

	function handleOpenTemporaryReceipt() {
		if (!activeOrder) return;
		cashierStore.lastCompletedOrder = activeOrder;
		cashierStore.isTemporaryReceipt = true;
		cashierStore.isReceiptOpen = true;
	}

	let itemPriceDrafts = $state<Record<string, number | undefined>>({});

	function handlePriceChange(itemId: string, val: number | undefined) {
		if (!activeOrder) return;
		itemPriceDrafts[itemId] = val;
		cashierStore.updateItemPrice(activeOrder.id, itemId, val ?? 0);
	}

	function handlePriceBlur(itemId: string) {
		delete itemPriceDrafts[itemId];
	}

	function handleRemoveItem(itemId: string) {
		if (!activeOrder) return;
		cashierStore.removeItem(activeOrder.id, itemId);
	}

	function selectPaymentMethod(method: CashierPaymentMethod) {
		cashierStore.paymentMethod = method;
		if (method === 'PIUTANG') {
			cashierStore.singleAmount = 0;
			onOpenCreditLimit();
		} else {
			cashierStore.singleAmount = null;
		}
	}

	function setQuickCash(amount: number | null) {
		cashierStore.singleAmount = amount;
	}

	let isUangPasSelected = $derived(
		cashierStore.singleAmount === null ||
			(cashierStore.singleAmount === cashierStore.grandTotal &&
				![50000, 100000, 200000, 500000].includes(cashierStore.singleAmount))
	);
</script>

{#if !activeOrder}
	<!-- Empty State (No ticket selected, Master Data Card) -->
	<Card
		class="flex h-full min-h-130 flex-col items-center justify-center p-8 text-center shadow-none"
	>
		<div
			class="bg-muted/50 flex size-12 items-center justify-center rounded-lg border border-border/80 text-foreground-subtle"
		>
			<IconReceipt class="size-6 text-foreground-subtle" />
		</div>
		<Typography variant="h3" as="h3" class="mt-4 font-bold text-foreground">
			Pilih Antrean Transaksi
		</Typography>
		<Typography
			variant="muted"
			as="p"
			class="mt-1.5 max-w-xs text-xs leading-relaxed text-foreground-subtle"
		>
			Pilih salah satu tiket pesanan di panel kiri untuk mulai memproses rincian transaksi dan
			pembayaran kasir.
		</Typography>
	</Card>
{:else}
	<!-- Active Order Workspace (NO shadow, Card wrapper) -->
	<Card class="flex flex-col overflow-hidden shadow-none">
		<!-- 1. Header Customer & Order Meta -->
		<div class="bg-muted/15 flex flex-col gap-2.5 border-b border-border/60 p-4 sm:p-4">
			<div class="flex items-center justify-between gap-3">
				<!-- Customer avatar & identity -->
				<div class="flex min-w-0 items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg border {activeOrder.orderType ===
						'RETAIL'
							? 'border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400'
							: 'border-primary/20 bg-primary/10 text-primary'} text-sm font-bold"
					>
						{activeOrder.customerName.charAt(0).toUpperCase()}
					</div>
					<div class="flex min-w-0 flex-col">
						<div class="flex items-center gap-2">
							{#if activeOrder.customerType === 'reseller'}
								<Tooltip
									placement="top"
									delayDuration={200}
									showArrow
									classes={{
										content:
											'rounded-md border border-border bg-app-surface px-2.5 py-1.5 text-xs text-foreground shadow-md',
										arrow:
											'bg-app-surface border-border group-data-[placement=top]:border-r group-data-[placement=top]:border-b group-data-[placement=bottom]:border-l group-data-[placement=bottom]:border-t'
									}}
								>
									{#snippet content()}
										<div class="flex items-center gap-2 text-left">
											<IconHandshake class="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
											<div class="flex flex-col">
												<span class="font-bold text-foreground">Plafon Kredit Reseller</span>
												<span class="text-[11px] text-foreground-subtle">
													Klik untuk cek limit plafon & hutang berjalan
												</span>
											</div>
										</div>
									{/snippet}
									<button
										type="button"
										onclick={onOpenCreditLimit}
										class="group inline-flex cursor-pointer items-center gap-2 text-left transition-colors"
									>
										<span
											class="truncate text-base font-bold text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
										>
											{activeOrder.customerName}
										</span>
										<span
											class="inline-flex items-center justify-center rounded-md border border-indigo-500/25 bg-indigo-500/10 p-1 text-indigo-600 transition-all group-hover:scale-105 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/20 dark:text-indigo-400"
										>
											<IconHandshake class="size-3.5" />
										</span>
									</button>
								</Tooltip>
							{:else}
								<span class="truncate text-base font-bold text-foreground">
									{activeOrder.customerName}
								</span>
							{/if}
						</div>
						<div class="flex items-center gap-2 text-xs text-foreground-subtle">
							<span>{activeOrder.jobNumber}</span>
							{#if activeOrder.customerPhone && activeOrder.customerPhone !== '-'}
								<span>•</span>
								<span>{activeOrder.customerPhone}</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Quick Secondary Action Buttons (Draft / Cancel / Merge) -->
				<div class="flex shrink-0 items-center gap-1.5">
					{#if activeOrder.status !== 'LUNAS'}
						{#if activeOrder.orderType === 'RETAIL'}
							<Tooltip
								placement="top"
								delayDuration={200}
								showArrow
								classes={{
									content:
										'max-w-xs rounded-md border border-border bg-app-surface p-2.5 text-xs text-foreground shadow-md',
									arrow:
										'bg-app-surface border-border group-data-[placement=top]:border-r group-data-[placement=top]:border-b group-data-[placement=bottom]:border-l group-data-[placement=bottom]:border-t'
								}}
							>
								{#snippet content()}
									<div class="flex items-start gap-2 text-left">
										<IconCircleAlert
											class="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400"
										/>
										<div class="flex flex-col gap-1">
											<span class="font-bold text-sky-600 dark:text-sky-400">
												Gabung ke Tiket Cetak
											</span>
											<span class="text-[11px] leading-relaxed text-foreground-subtle">
												Gabungkan nota ritel ini ke tiket produksi cetak milik pelanggan yang sama
												untuk pembayaran sekaligus.
											</span>
										</div>
									</div>
								{/snippet}
								<button
									type="button"
									onclick={onOpenMergeTicket}
									class="flex cursor-pointer items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400"
								>
									<IconLayers class="size-3.5 text-sky-500" />
									<span>Gabung</span>
								</button>
							</Tooltip>
						{:else}
							<Tooltip
								placement="top"
								delayDuration={200}
								showArrow
								classes={{
									content:
										'max-w-xs rounded-md border border-border bg-app-surface p-2.5 text-xs text-foreground shadow-md',
									arrow:
										'bg-app-surface border-border group-data-[placement=top]:border-r group-data-[placement=top]:border-b group-data-[placement=bottom]:border-l group-data-[placement=bottom]:border-t'
								}}
							>
								{#snippet content()}
									<div class="flex items-start gap-2 text-left">
										<IconCircleAlert
											class="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
										/>
										<div class="flex flex-col gap-1">
											<span class="font-bold text-amber-600 dark:text-amber-400">
												Kembalikan ke Draft Desainer
											</span>
											<span class="text-[11px] leading-relaxed text-foreground-subtle">
												Tarik tiket cetak kembali ke meja desainer untuk koreksi salah input
												spesifikasi atau penyesuaian (tambah/kurang) item pesanan.
											</span>
										</div>
									</div>
								{/snippet}
								<button
									type="button"
									onclick={onOpenDraftConfirm}
									class="flex cursor-pointer items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
								>
									<IconCornerUpLeft class="size-3.5 text-amber-500" />
									<span>Draft</span>
								</button>
							</Tooltip>
						{/if}
						<Tooltip
							placement="top"
							delayDuration={200}
							showArrow
							classes={{
								content:
									'max-w-xs rounded-md border border-border bg-app-surface p-2.5 text-xs text-foreground shadow-md',
								arrow:
									'bg-app-surface border-border group-data-[placement=top]:border-r group-data-[placement=top]:border-b group-data-[placement=bottom]:border-l group-data-[placement=bottom]:border-t'
							}}
						>
							{#snippet content()}
								<div class="flex items-start gap-2 text-left">
									<IconCircleAlert
										class="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400"
									/>
									<div class="flex flex-col gap-1">
										<span class="font-bold text-rose-600 dark:text-rose-400">Batalkan Pesanan</span>
										<span class="text-[11px] leading-relaxed text-foreground-subtle">
											Batalkan tiket atau nota ini dari antrean kasir apabila pesanan dibatalkan
											oleh pelanggan.
										</span>
									</div>
								</div>
							{/snippet}
							<button
								type="button"
								onclick={onOpenCancelConfirm}
								class="flex cursor-pointer items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
							>
								<IconTrash2 class="size-3.5 text-rose-500" />
								<span>Batal</span>
							</button>
						</Tooltip>
					{/if}
				</div>
			</div>

			<!-- Meta Info Pill Bar (Colored Accents) -->
			<div class="flex flex-wrap items-center gap-2 pt-1 text-xs text-foreground-subtle">
				{#if activeOrder.designerName}
					<div
						class="flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-800 dark:text-amber-300"
					>
						<IconPalette class="size-3 text-amber-600 dark:text-amber-400" />
						<span>Desainer: <strong>{activeOrder.designerName}</strong></span>
					</div>
				{/if}

				<div
					class="flex items-center gap-1.5 rounded-md border border-border/80 bg-card px-2 py-0.5"
				>
					<IconClock class="size-3 text-foreground-subtle" />
					<span class="font-medium text-foreground">
						{formatCashierDateTime(activeOrder.createdAt)}
					</span>
				</div>
			</div>
		</div>

		<!-- 2. Rincian Item Belanja -->
		<div class="flex flex-col gap-2.5 p-4 sm:p-4">
			<div class="flex items-center justify-between">
				<span class="text-[11px] font-bold tracking-wider text-foreground-subtle uppercase">
					Rincian Item ({activeOrder.items.length})
				</span>
				<div class="flex items-center gap-1.5">
					{#if activeOrder.status !== 'LUNAS' && activeOrder.orderType !== 'RETAIL' && hasRetailItems}
						<Tooltip
							placement="top"
							delayDuration={150}
							showArrow
							classes={{
								content:
									'rounded-md border border-border bg-app-surface px-2.5 py-1.5 text-xs text-foreground shadow-lg max-w-xs z-50',
								arrow:
									'bg-app-surface border-border group-data-[placement=top]:border-r group-data-[placement=top]:border-b'
							}}
						>
							{#snippet content()}
								<div class="flex flex-col gap-0.5 text-left">
									<span class="font-bold text-foreground">Pisahkan ke Nota Ritel Baru</span>
									<span class="text-[11px] leading-tight text-foreground-subtle">
										Pindahkan {retailItemsCount} item ritel sekaligus dari tiket produksi ini ke 1 nota
										transaksi ritel baru terpisah.
									</span>
								</div>
							{/snippet}
							<button
								type="button"
								onclick={onOpenSplitRetailBatch}
								class="inline-flex size-7.5 cursor-pointer items-center justify-center rounded-md border border-border bg-app-surface text-foreground-subtle transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-600 active:scale-95"
								aria-label="Pisahkan item ritel ke nota baru"
							>
								<IconScissors class="size-3.5 text-orange-600 dark:text-orange-400" />
							</button>
						</Tooltip>
					{/if}

					{#if activeOrder.status !== 'LUNAS'}
						<button
							type="button"
							onclick={onOpenAddRetail}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-700 transition-all hover:border-orange-500/50 hover:bg-orange-500/20 active:scale-95 dark:text-orange-300"
						>
							<IconPlus class="size-3.5 text-orange-600 dark:text-orange-400" />
							<span>Tambah Item Ritel</span>
						</button>
					{/if}
				</div>
			</div>

			<!-- Items List Container -->
			<div class="flex max-h-70 flex-col divide-y divide-border/40 overflow-y-auto pr-1">
				{#each activeOrder.items as item, idx (item.id)}
					<div class="flex items-start justify-between gap-3 py-2.5 text-xs">
						<div class="flex flex-1 flex-col gap-1">
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-bold text-foreground">
									{idx + 1}. {item.productName}
								</span>
								{#if !item.isProduction}
									<Tooltip
										placement="top"
										delayDuration={150}
										showArrow
										classes={{
											content:
												'rounded-md border border-border bg-app-surface px-2 py-1 text-xs text-foreground shadow-md',
											arrow:
												'bg-app-surface border-border group-data-[placement=top]:border-r group-data-[placement=top]:border-b'
										}}
									>
										{#snippet content()}
											<span class="font-semibold text-orange-600 dark:text-orange-400">
												Produk Ritel
											</span>
										{/snippet}
										<span
											class="inline-flex items-center justify-center rounded border border-orange-500/30 bg-orange-500/10 p-1 text-orange-600 dark:text-orange-400"
										>
											<IconShoppingBag class="size-3" />
										</span>
									</Tooltip>

									{#if activeOrder.status !== 'LUNAS'}
										<Tooltip
											placement="top"
											delayDuration={150}
											showArrow
											classes={{
												content:
													'rounded-md border border-border bg-app-surface px-2 py-1 text-xs text-foreground shadow-md',
												arrow:
													'bg-app-surface border-border group-data-[placement=top]:border-r group-data-[placement=top]:border-b'
											}}
										>
											{#snippet content()}
												<span class="font-semibold text-rose-600 dark:text-rose-400">
													Hapus Item Ritel
												</span>
											{/snippet}
											<button
												type="button"
												aria-label="Hapus Item Ritel"
												onclick={() => handleRemoveItem(item.id)}
												class="inline-flex size-5 cursor-pointer items-center justify-center rounded border border-border text-foreground-subtle transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600 active:scale-95"
											>
												<IconTrash2 class="size-3" />
											</button>
										</Tooltip>
									{/if}
								{/if}
							</div>

							<span class="text-[11px] text-foreground-subtle">
								{item.dimensionText}
								{item.finishingText && item.finishingText !== '-' ? `• ${item.finishingText}` : ''}
							</span>

							<!-- Price override / details using NumberField -->
							{#if activeOrder.status === 'LUNAS'}
								<span class="mt-0.5 text-xs font-semibold text-foreground">
									{formatCurrency(item.pricePerUnit)}
									{#if item.uom === 'm2' && item.lengthM && item.widthM}
										<span class="font-normal text-foreground-subtle">
											× {(item.lengthM * item.widthM).toFixed(2)} m²
										</span>
									{/if}
									<span class="font-normal text-foreground-subtle"> × </span>
									<span class="font-bold text-primary">
										{item.quantity}
										<span class="text-[11px] font-semibold text-primary/80">
											{item.uom === 'm2' ? 'pcs' : item.uom}
										</span>
									</span>
								</span>
							{:else}
								<div class="mt-1 flex items-center gap-2">
									<NumberField
										size="sm"
										thousandSeparator
										value={item.id in itemPriceDrafts
											? itemPriceDrafts[item.id]
											: item.pricePerUnit}
										onValueChange={(val) => handlePriceChange(item.id, val)}
										onblur={() => handlePriceBlur(item.id)}
										classes={{ input: 'text-right font-semibold' }}
										class="w-32 font-semibold"
									>
										{#snippet prefix()}
											<span class="text-[10px] font-bold text-foreground-subtle">Rp</span>
										{/snippet}
									</NumberField>

									<div class="flex items-center gap-1 text-[11px] text-foreground-subtle">
										{#if item.uom === 'm2' && item.lengthM && item.widthM}
											<span>× {(item.lengthM * item.widthM).toFixed(2)} m²</span>
										{/if}
										<span>×</span>
										<span class="text-xs font-bold text-primary">
											{item.quantity}
											<span class="text-[11px] font-semibold text-primary/80">
												{item.uom === 'm2' ? 'pcs' : item.uom}
											</span>
										</span>
									</div>
								</div>
							{/if}
						</div>

						<!-- Subtotal line item -->
						<div class="flex shrink-0 items-center self-center">
							<span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
								{item.pricePerUnit > 0 ? formatCurrency(item.subtotal) : '-'}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- 3. Financial Summary (Linear-style Soft Minimal) -->
		<div class="px-4 pb-4 sm:px-4 sm:pb-4">
			<div
				class="bg-muted/20 flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconHandCoins class="size-5" />
					</div>
					<div class="flex flex-col">
						<span class="text-[11px] font-bold tracking-wider text-primary uppercase">
							Total Tagihan
						</span>
						<span class="text-xs text-foreground-subtle">
							{activeOrder.items.length} item pesanan
						</span>
					</div>
				</div>

				<span class="text-2xl font-bold tracking-tight text-primary">
					{cashierStore.grandTotal > 0 ? formatCurrency(cashierStore.grandTotal) : 'Rp 0'}
				</span>
			</div>
		</div>

		<!-- 4. Payment Workspace Section -->
		<div class="bg-muted/15 flex flex-col gap-3.5 border-t border-border/60 p-4 sm:p-4">
			{#if activeOrder.status === 'LUNAS' || activeOrder.status === 'PARTIAL_PAID'}
				<!-- Status Banner if Paid -->
				<div
					class="flex items-center justify-between rounded-lg border p-4 {activeOrder.status ===
					'LUNAS'
						? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
						: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'}"
				>
					<div class="flex items-center gap-3">
						<div
							class="flex size-9 items-center justify-center rounded-md {activeOrder.status ===
							'LUNAS'
								? 'bg-emerald-500/20 text-emerald-600'
								: 'bg-amber-500/20 text-amber-600'}"
						>
							{#if activeOrder.status === 'LUNAS'}
								<IconCheck class="size-5" />
							{:else}
								<IconClock class="size-5" />
							{/if}
						</div>
						<div class="flex flex-col">
							<span class="text-xs font-bold uppercase">
								{activeOrder.status === 'LUNAS' ? 'Transaksi Lunas' : 'Panjar / DP'}
							</span>
							<span class="text-xs text-foreground-subtle">
								Terbayar via {activeOrder.paymentMethod} ({formatCurrency(
									activeOrder.totalPaid || 0
								)})
							</span>
						</div>
					</div>

					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							cashierStore.lastCompletedOrder = activeOrder;
							cashierStore.isTemporaryReceipt = false;
							cashierStore.isReceiptOpen = true;
						}}
						class="h-8 gap-1.5 rounded-md text-xs font-bold"
					>
						<IconPrinter class="size-3.5" />
						<span>Cetak Struk</span>
					</Button>
				</div>
			{:else}
				<!-- Split Payment Toggle with Brand Color Styling & Information Icon -->
				<div
					class="flex items-center justify-between gap-4 rounded-lg border p-3.5 transition-colors sm:p-4 {cashierStore.isSplitPayment
						? 'border-primary/50 bg-primary/8'
						: 'border-primary/30 bg-primary/3'}"
				>
					<div class="flex min-w-0 items-start gap-3">
						<!-- Circle Information Icon in Brand Color -->
						<div
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
						>
							<IconInfo class="size-4 text-primary" />
						</div>

						<!-- Title & Informative Description -->
						<label
							for="split-payment-toggle"
							class="flex min-w-0 cursor-pointer flex-col gap-0.5 select-none"
						>
							<span class="text-xs font-bold tracking-wide text-primary"> Split Pembayaran </span>
							<span class="text-[11px] leading-relaxed text-foreground-subtle">
								Pelunasan tagihan transaksi menggunakan kombinasi beberapa metode pembayaran
								sekaligus (Tunai, Transfer Bank, dan QRIS).
							</span>
						</label>
					</div>

					<!-- Switch Toggle positioned on the Right -->
					<div class="shrink-0">
						<Switch
							id="split-payment-toggle"
							checked={cashierStore.isSplitPayment}
							onCheckedChange={(val) => {
								cashierStore.isSplitPayment = val;
								cashierStore.singleAmount = null;
								cashierStore.splitAmounts = { cash: 0, transfer: 0, qris: 0 };
							}}
						/>
					</div>
				</div>

				{#if !cashierStore.isSplitPayment}
					<!-- Single Method Selector (Segmented Cards with Distinct Hues) -->
					<div class="flex flex-col gap-2.5">
						<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
							Pilih Metode Pembayaran
						</span>

						<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
							<!-- 1. CASH / Tunai (Emerald accent) -->
							<button
								type="button"
								onclick={() => selectPaymentMethod('CASH')}
								class="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-center transition-all {cashierStore.paymentMethod ===
								'CASH'
									? 'border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-700 shadow-2xs dark:text-emerald-300'
									: 'border-border/80 bg-app-surface text-foreground-subtle hover:border-border hover:bg-muted/40 hover:text-foreground'}"
							>
								<IconBanknote class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
								<span class="text-xs font-bold">Tunai</span>
							</button>

							<!-- 2. TRANSFER (Sky accent) -->
							<button
								type="button"
								onclick={() => selectPaymentMethod('TRANSFER')}
								class="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-center transition-all {cashierStore.paymentMethod ===
								'TRANSFER'
									? 'border-sky-500/50 bg-sky-500/10 font-bold text-sky-700 shadow-2xs dark:text-sky-300'
									: 'border-border/80 bg-app-surface text-foreground-subtle hover:border-border hover:bg-muted/40 hover:text-foreground'}"
							>
								<IconCreditCard class="size-4 shrink-0 text-sky-600 dark:text-sky-400" />
								<span class="text-xs font-bold">Transfer</span>
							</button>

							<!-- 3. QRIS (Violet accent) -->
							<button
								type="button"
								onclick={() => selectPaymentMethod('QRIS')}
								class="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-center transition-all {cashierStore.paymentMethod ===
								'QRIS'
									? 'border-violet-500/50 bg-violet-500/10 font-bold text-violet-700 shadow-2xs dark:text-violet-300'
									: 'border-border/80 bg-app-surface text-foreground-subtle hover:border-border hover:bg-muted/40 hover:text-foreground'}"
							>
								<IconQrCode class="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
								<span class="text-xs font-bold">QRIS</span>
							</button>

							<!-- 4. TEMPO (Amber accent) -->
							<button
								type="button"
								onclick={() => selectPaymentMethod('PIUTANG')}
								class="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-center transition-all {cashierStore.paymentMethod ===
								'PIUTANG'
									? 'border-amber-500/50 bg-amber-500/10 font-bold text-amber-700 shadow-2xs dark:text-amber-300'
									: 'border-border/80 bg-app-surface text-foreground-subtle hover:border-border hover:bg-muted/40 hover:text-foreground'}"
							>
								<IconClock class="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
								<span class="text-xs font-bold">Tempo</span>
							</button>
						</div>

						<!-- Cash & Transfer Nominal Input with NumberField (thousandSeparator) -->
						{#if cashierStore.paymentMethod !== 'PIUTANG'}
							<div class="mt-1 flex flex-col gap-2">
								<div class="flex items-center justify-between">
									<span
										class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
									>
										Nominal Pembayaran
									</span>
								</div>

								<NumberField
									size="md"
									thousandSeparator
									value={cashierStore.singleAmount === null
										? cashierStore.grandTotal
										: cashierStore.singleAmount}
									onValueChange={(val) => {
										cashierStore.singleAmount = val;
									}}
									onblur={() => {
										if (cashierStore.singleAmount === undefined) {
											cashierStore.singleAmount = null;
										}
									}}
									placeholder="Masukkan nominal bayar..."
									classes={{ input: 'text-right font-bold' }}
									class="w-full text-base font-bold"
								>
									{#snippet prefix()}
										<span class="text-xs font-bold text-foreground-subtle">Rp</span>
									{/snippet}
								</NumberField>

								<!-- Quick cash pills with status circle dot -->
								{#if cashierStore.paymentMethod === 'CASH'}
									<div class="flex flex-wrap items-center gap-1.5">
										<!-- Uang Pas Chip -->
										<button
											type="button"
											onclick={() => setQuickCash(null)}
											class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all select-none active:scale-95 {isUangPasSelected
												? 'border-primary/50 bg-primary/10 text-primary font-bold shadow-2xs'
												: 'border-border/80 bg-app-surface text-foreground-subtle hover:border-border hover:bg-muted/40 hover:text-foreground'}"
										>
											<span
												class="size-1.5 shrink-0 rounded-full transition-colors {isUangPasSelected
													? 'bg-primary'
													: 'bg-neutral-400 dark:bg-neutral-500'}"
											></span>
											<span>Uang Pas</span>
										</button>

										<!-- Preset Nominal Chips -->
										{#each [50000, 100000, 200000, 500000] as amount (amount)}
											{@const isSelected = cashierStore.singleAmount === amount}
											<button
												type="button"
												onclick={() => setQuickCash(amount)}
												class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all select-none active:scale-95 {isSelected
													? 'border-primary/50 bg-primary/10 text-primary font-bold shadow-2xs'
													: 'border-border/80 bg-app-surface text-foreground-subtle hover:border-border hover:bg-muted/40 hover:text-foreground'}"
											>
												<span
													class="size-1.5 shrink-0 rounded-full transition-colors {isSelected
														? 'bg-primary'
														: 'bg-neutral-400 dark:bg-neutral-500'}"
												></span>
												<span>{formatCurrency(amount)}</span>
											</button>
										{/each}
									</div>
								{/if}

								<!-- Change or Remaining Note (Colored Alert) -->
								{#if cashierStore.changeAmount > 0}
									<div
										class="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300"
									>
										<div class="flex items-center gap-1.5">
											<IconCircleCheck class="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
											<span class="font-bold">Kembalian:</span>
										</div>
										<span class="text-sm font-black">
											{formatCurrency(cashierStore.changeAmount)}
										</span>
									</div>
								{:else if cashierStore.remainingAmount > 0}
									<div
										class="flex items-center justify-between rounded-lg border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300"
									>
										<div class="flex items-center gap-1.5">
											<IconCircleAlert class="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
											<span class="font-bold">Sisa Tagihan:</span>
										</div>
										<span class="text-sm font-black">
											{formatCurrency(cashierStore.remainingAmount)}
										</span>
									</div>
								{/if}
							</div>
						{:else}
							<!-- Piutang Warning & Action -->
							<div
								class="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5 text-xs"
							>
								<div class="flex items-center gap-2 font-bold text-foreground">
									<IconInfo class="size-4 text-amber-500" />
									<span>Pembayaran Tempo / Piutang Reseller</span>
								</div>
								<p class="text-xs leading-relaxed text-foreground-subtle">
									Tagihan sebesar <strong class="text-foreground">
										{formatCurrency(cashierStore.grandTotal)}
									</strong> akan dicatat ke saldo piutang reseller ini.
								</p>
								<Button
									variant="outline"
									size="sm"
									onclick={onOpenCreditLimit}
									class="mt-1 h-8 self-start rounded-md text-xs font-semibold"
								>
									Cek Plafon Kredit
								</Button>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Split Payment Multi Inputs with NumberField thousandSeparator -->
					<div class="flex flex-col gap-2.5">
						<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
							Rincian Multi-Pembayaran
						</span>

						<div class="flex flex-col gap-2 text-xs">
							<!-- Cash Row -->
							<div
								class="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card p-2"
							>
								<div class="flex items-center gap-2 font-medium text-foreground">
									<IconBanknote class="size-4 text-emerald-600 dark:text-emerald-400" />
									<span>Tunai (Cash)</span>
								</div>
								<NumberField
									size="sm"
									thousandSeparator
									value={cashierStore.splitAmounts.cash}
									onValueChange={(val) => {
										cashierStore.splitAmounts.cash = val;
									}}
									onblur={() => {
										if (cashierStore.splitAmounts.cash === undefined) {
											cashierStore.splitAmounts.cash = 0;
										}
									}}
									placeholder="0"
									classes={{ input: 'text-right font-bold' }}
									class="w-36 font-bold"
								>
									{#snippet prefix()}
										<span class="text-[10px] font-bold text-foreground-subtle">Rp</span>
									{/snippet}
								</NumberField>
							</div>

							<!-- Transfer Row -->
							<div
								class="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card p-2"
							>
								<div class="flex items-center gap-2 font-medium text-foreground">
									<IconCreditCard class="size-4 text-sky-600 dark:text-sky-400" />
									<span>Transfer Bank</span>
								</div>
								<NumberField
									size="sm"
									thousandSeparator
									value={cashierStore.splitAmounts.transfer}
									onValueChange={(val) => {
										cashierStore.splitAmounts.transfer = val;
									}}
									onblur={() => {
										if (cashierStore.splitAmounts.transfer === undefined) {
											cashierStore.splitAmounts.transfer = 0;
										}
									}}
									placeholder="0"
									classes={{ input: 'text-right font-bold' }}
									class="w-36 font-bold"
								>
									{#snippet prefix()}
										<span class="text-[10px] font-bold text-foreground-subtle">Rp</span>
									{/snippet}
								</NumberField>
							</div>

							<!-- QRIS Row -->
							<div
								class="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card p-2"
							>
								<div class="flex items-center gap-2 font-medium text-foreground">
									<IconQrCode class="size-4 text-violet-600 dark:text-violet-400" />
									<span>QRIS</span>
								</div>
								<NumberField
									size="sm"
									thousandSeparator
									value={cashierStore.splitAmounts.qris}
									onValueChange={(val) => {
										cashierStore.splitAmounts.qris = val;
									}}
									onblur={() => {
										if (cashierStore.splitAmounts.qris === undefined) {
											cashierStore.splitAmounts.qris = 0;
										}
									}}
									placeholder="0"
									classes={{ input: 'text-right font-bold' }}
									class="w-36 font-bold"
								>
									{#snippet prefix()}
										<span class="text-[10px] font-bold text-foreground-subtle">Rp</span>
									{/snippet}
								</NumberField>
							</div>
						</div>

						<div
							class="flex items-center justify-between border-t border-border/40 pt-2 text-xs font-semibold"
						>
							<span class="text-foreground-subtle">Total Terbayar:</span>
							<span class="font-bold text-foreground">
								{formatCurrency(cashierStore.totalPayingAmount)}
							</span>
						</div>

						{#if cashierStore.changeAmount > 0}
							<div
								class="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300"
							>
								<span class="font-medium">Kembalian:</span>
								<span class="text-sm font-black">{formatCurrency(cashierStore.changeAmount)}</span>
							</div>
						{:else if cashierStore.remainingAmount > 0}
							<div
								class="flex items-center justify-between rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300"
							>
								<span class="font-medium">Sisa Tagihan:</span>
								<span class="text-sm font-black">
									{formatCurrency(cashierStore.remainingAmount)}
								</span>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Action CTAs: Cetak Nota Sementara & Konfirmasi Pembayaran -->
				<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-12">
					<!-- 1. Cetak Nota Sementara (Draft / Proforma) -->
					<Button
						variant="outline"
						size="lg"
						onclick={handleOpenTemporaryReceipt}
						class="h-11 sm:col-span-5 gap-2 rounded-md border-border text-xs font-bold text-foreground hover:bg-muted active:scale-[0.99]"
					>
						<IconFileText class="size-4 text-foreground-subtle" />
						<span>Nota Sementara</span>
					</Button>

					<!-- 2. Konfirmasi Pembayaran & Cetak Struk (Primary) -->
					<Button
						variant="default"
						size="lg"
						onclick={handlePay}
						disabled={isProcessing ||
							(cashierStore.paymentMethod !== 'PIUTANG' && cashierStore.totalPayingAmount === 0)}
						class="h-11 sm:col-span-7 gap-2 rounded-md text-xs font-bold active:scale-[0.99]"
					>
						<IconPrinter class="size-4" />
						<span>
							{isProcessing ? 'Memproses...' : 'Bayar & Cetak Struk'}
						</span>
					</Button>
				</div>
			{/if}
		</div>
	</Card>
{/if}
