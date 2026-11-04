<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconReceipt from '~icons/lucide/receipt';
	import IconPlus from '~icons/lucide/plus';

	pageTitleStore.set('Kasir & POS');
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Kasir & Point of Sale (POS)
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Hitung cepat order walk-in, cetak nota, dan input pembayaran DP atau lunas.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Transaksi Baru
		</Button>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">Terminal Kasir Walk-in</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconReceipt class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground">
				Modul Kasir Siap Diintegrasikan
			</span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Mendukung kalkulasi otomatis meter persegi ($m^2$), kelipatan A3+, meter lari DTF, dan skema
				diskon tier reseller.
			</p>
		</CardContent>
	</Card>
</div>
