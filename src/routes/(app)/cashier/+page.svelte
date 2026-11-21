<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { cashierStore } from '$features/cashier/application/cashier.store.svelte';
	import CashierPage from '$features/cashier/presentation/pages/CashierPage.svelte';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconClock from '~icons/lucide/clock';

	pageTitleStore.set('Kasir');
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-start gap-3.5 sm:gap-4">
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
			>
				<IconShoppingBag class="size-5" />
			</div>
			<div class="flex flex-col">
				<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
					Kasir
				</Typography>
				<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
					Proses pembayaran tiket cetak dari desainer dan transaksi produk ritel walk-in.
				</Typography>
			</div>
		</div>

		<!-- Widget Status Total Antrean -->
		<div
			class="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2"
		>
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
			>
				<IconClock class="size-4" />
			</div>
			<div class="flex flex-col leading-tight">
				<span class="text-[10px] font-bold tracking-wider text-foreground-subtle uppercase">
					Total Antrean
				</span>
				<span class="text-sm font-semibold text-foreground">
					{cashierStore.pendingQueueCount} Transaksi
				</span>
			</div>
		</div>
	</div>

	<!-- Master Cashier Slicing (Queue + Checkout) -->
	<CashierPage />
</div>
