<script lang="ts">
	import { onMount } from 'svelte';
	import { cashierStore } from '../../application/cashier.store.svelte';
	import CashierQueueList from '../components/CashierQueueList.svelte';
	import CashierCheckoutPanel from '../components/CashierCheckoutPanel.svelte';
	import AddRetailItemDialog from '../components/AddRetailItemDialog.svelte';
	import CreateRetailOrderDialog from '../components/CreateRetailOrderDialog.svelte';
	import MergeToProductionTicketDialog from '../components/MergeToProductionTicketDialog.svelte';
	import ResellerCreditLimitDialog from '../components/ResellerCreditLimitDialog.svelte';
	import SplitRetailBatchDialog from '../components/SplitRetailBatchDialog.svelte';
	import CashierReceiptDialog from '../components/CashierReceiptDialog.svelte';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconCornerUpLeft from '~icons/lucide/corner-up-left';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconX from '~icons/lucide/x';

	// Dialog open states
	let isAddRetailOpen = $state(false);
	let isSplitRetailBatchOpen = $state(false);
	let isCreateRetailOpen = $state(false);
	let isMergeTicketOpen = $state(false);
	let isCreditLimitOpen = $state(false);
	let isDraftConfirmOpen = $state(false);
	let isCancelConfirmOpen = $state(false);
	let cancelReason = $state('');

	onMount(() => {
		cashierStore.load();
	});

	async function handleConfirmDraft() {
		if (!cashierStore.activeOrder) return;
		await cashierStore.sendToDraft(cashierStore.activeOrder.id);
		isDraftConfirmOpen = false;
	}

	async function handleConfirmCancel() {
		if (!cashierStore.activeOrder || !cancelReason.trim()) return;
		await cashierStore.cancelOrder(cashierStore.activeOrder.id, cancelReason.trim());
		cancelReason = '';
		isCancelConfirmOpen = false;
	}
</script>

<div class="flex flex-col items-start gap-6 lg:flex-row">
	<!-- Left Column: Antrean Pesanan (Fluid Remaining Space) -->
	<div class="min-w-0 flex-1">
		<CashierQueueList onCreateRetailOrder={() => (isCreateRetailOpen = true)} />
	</div>

	<!-- Right Column: Workspace Transaksi Kasir (Fixed Ergonomic Width) -->
	<div class="w-full shrink-0 lg:sticky lg:top-6 lg:w-130 xl:w-140">
		<CashierCheckoutPanel
			onOpenAddRetail={() => (isAddRetailOpen = true)}
			onOpenSplitRetailBatch={() => (isSplitRetailBatchOpen = true)}
			onOpenDraftConfirm={() => (isDraftConfirmOpen = true)}
			onOpenCancelConfirm={() => {
				cancelReason = '';
				isCancelConfirmOpen = true;
			}}
			onOpenMergeTicket={() => (isMergeTicketOpen = true)}
			onOpenCreditLimit={() => (isCreditLimitOpen = true)}
		/>
	</div>
</div>

<!-- Modal: Tambah Item Ritel ke Tiket Aktif -->
<AddRetailItemDialog open={isAddRetailOpen} onClose={() => (isAddRetailOpen = false)} />

<!-- Modal: Pisahkan Item Ritel ke Nota Baru (Batch) -->
<SplitRetailBatchDialog
	open={isSplitRetailBatchOpen}
	onClose={() => (isSplitRetailBatchOpen = false)}
/>

<!-- Modal: Buat Nota Ritel Baru -->
<CreateRetailOrderDialog open={isCreateRetailOpen} onClose={() => (isCreateRetailOpen = false)} />

<!-- Modal: Gabung Nota Ritel ke Tiket Produksi -->
<MergeToProductionTicketDialog
	open={isMergeTicketOpen}
	onClose={() => (isMergeTicketOpen = false)}
/>

<!-- Modal: Status Plafon Kredit Reseller -->
<ResellerCreditLimitDialog open={isCreditLimitOpen} onClose={() => (isCreditLimitOpen = false)} />

<!-- Modal: Struk Kasir Termal -->
<CashierReceiptDialog
	open={cashierStore.isReceiptOpen}
	onClose={() => {
		cashierStore.isReceiptOpen = false;
		cashierStore.lastCompletedOrder = null;
	}}
/>

<!-- Dialog Konfirmasi: Kirim ke Draft -->
{#if isDraftConfirmOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<button
			type="button"
			class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
			onclick={() => (isDraftConfirmOpen = false)}
			aria-label="Tutup dialog"
		></button>

		<div
			class="relative z-10 flex w-full max-w-md flex-col rounded-lg border border-border bg-app-surface p-5 shadow-2xl"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
					<IconCornerUpLeft class="size-5" />
					<span class="text-sm font-bold text-foreground">Kembalikan ke Draft Desainer?</span>
				</div>
				<button
					type="button"
					onclick={() => (isDraftConfirmOpen = false)}
					class="hover:bg-muted cursor-pointer rounded-md p-1.5 text-foreground-subtle"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<p class="my-4 text-xs leading-relaxed text-foreground-subtle">
				Tiket <strong class="text-foreground">{cashierStore.activeOrder?.jobNumber}</strong> akan ditarik
				dari antrean kasir dan dikembalikan ke meja desainer untuk koreksi salah input, revisi spesifikasi,
				atau penyesuaian (tambah/kurang) item pesanan.
			</p>

			<div class="flex items-center justify-end gap-2 pt-1">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (isDraftConfirmOpen = false)}
					class="h-8 cursor-pointer rounded-md text-xs font-bold"
				>
					Batal
				</Button>
				<Button
					variant="default"
					size="sm"
					onclick={handleConfirmDraft}
					class="h-8 cursor-pointer gap-1.5 rounded-md bg-amber-500 text-xs font-bold text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
				>
					<IconCornerUpLeft class="size-3.5 text-white" />
					<span>Ya, Kembalikan ke Draft</span>
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Dialog Konfirmasi: Batalkan Order -->
{#if isCancelConfirmOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<button
			type="button"
			class="fixed inset-0 cursor-pointer bg-black/50 backdrop-blur-xs transition-opacity"
			onclick={() => (isCancelConfirmOpen = false)}
			aria-label="Tutup dialog"
		></button>

		<div
			class="relative z-10 flex w-full max-w-md flex-col rounded-lg border border-border bg-app-surface p-5 shadow-2xl"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 text-rose-600">
					<IconTrash2 class="size-5" />
					<span class="text-sm font-bold text-foreground">Batalkan Pesanan Ini?</span>
				</div>
				<button
					type="button"
					onclick={() => (isCancelConfirmOpen = false)}
					class="hover:bg-muted cursor-pointer rounded-md p-1.5 text-foreground-subtle"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<div class="my-4 flex flex-col gap-2">
				<span class="text-xs text-foreground-subtle">
					Masukkan alasan pembatalan untuk pesanan
					<strong class="text-foreground">{cashierStore.activeOrder?.jobNumber}</strong>:
				</span>
				<textarea
					bind:value={cancelReason}
					placeholder="Contoh: Pelanggan membatalkan pesanan karena salah ukuran..."
					rows={3}
					class="bg-muted/40 w-full rounded-md border border-border p-2.5 text-xs font-medium text-foreground focus:border-rose-500 focus:outline-none"
				></textarea>
			</div>

			<div class="flex items-center justify-end gap-2 pt-1">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (isCancelConfirmOpen = false)}
					class="h-8 cursor-pointer rounded-md text-xs font-bold"
				>
					Kembali
				</Button>
				<Button
					variant="default"
					size="sm"
					onclick={handleConfirmCancel}
					disabled={!cancelReason.trim()}
					class="h-8 cursor-pointer gap-1.5 rounded-md bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
				>
					<IconTrash2 class="size-3.5" />
					<span>Batalkan Order</span>
				</Button>
			</div>
		</div>
	</div>
{/if}
