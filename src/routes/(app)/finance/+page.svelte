<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconBarChart3 from '~icons/lucide/bar-chart-3';

	pageTitleStore.set('Laporan Keuangan & Rekap');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Laporan Keuangan & Rekap Kasir
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Laporan omzet penjualan, laba kotor per SPK, rekap pembayaran kasir harian, dan piutang
			reseller.
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">Ringkasan Finansial</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconBarChart3 class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground">
				Laporan Laba Rugi & Rekapitulasi Kas
			</span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Analisis margin per kategori produk (Large Format vs Sheetfed vs DTF) dan per mesin cetak.
			</p>
		</CardContent>
	</Card>
</div>
