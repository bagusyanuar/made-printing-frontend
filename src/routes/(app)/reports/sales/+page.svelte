<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconTrendingUp from '~icons/lucide/trending-up';
	import IconDownload from '~icons/lucide/download';
	import IconSearch from '~icons/lucide/search';
	import IconReceipt from '~icons/lucide/receipt';
	import IconAward from '~icons/lucide/award';
	import IconClock from '~icons/lucide/clock';

	pageTitleStore.set('Laporan Penjualan');

	const stats = [
		{
			title: 'Total Omzet Penjualan (MTD)',
			value: 'Rp 68.450.000',
			subtitle: '+12.4% vs bulan lalu',
			icon: IconTrendingUp
		},
		{
			title: 'Total SPK Dikerjakan',
			value: '184 SPK',
			subtitle: 'Rata-rata 18 SPK / hari',
			icon: IconReceipt
		},
		{
			title: 'Rata-rata Nilai Order (AOV)',
			value: 'Rp 372.000',
			subtitle: 'Per transaksi customer & reseller',
			icon: IconAward
		},
		{
			title: 'Sisa Piutang Berjalan',
			value: 'Rp 14.200.000',
			subtitle: 'Termin tempo & DP belum lunas',
			icon: IconClock
		}
	];

	const categoryBreakdown = [
		{
			name: 'Large Format (Outdoor & Indoor)',
			revenue: 'Rp 36.800.000',
			share: '53.7%',
			qty: '820 m²'
		},
		{
			name: 'Digital Printing A3+ Sheetfed',
			revenue: 'Rp 18.250.000',
			share: '26.6%',
			qty: '1.450 lembar'
		},
		{ name: 'Sablon DTF & Apparel', revenue: 'Rp 9.100.000', share: '13.3%', qty: '210 meter' },
		{ name: 'Merchandise & UV Flatbed', revenue: 'Rp 4.300.000', share: '6.4%', qty: '140 pcs' }
	];

	const sampleSales = [
		{
			date: '04 Nov 2026',
			spkCount: '24 SPK',
			grossRevenue: 'Rp 8.920.000',
			cashPaid: 'Rp 6.420.000',
			receivable: 'Rp 2.500.000',
			topCategory: 'Large Format',
			status: 'Closed',
			statusVariant: 'success' as const
		},
		{
			date: '03 Nov 2026',
			spkCount: '19 SPK',
			grossRevenue: 'Rp 6.450.000',
			cashPaid: 'Rp 5.200.000',
			receivable: 'Rp 1.250.000',
			topCategory: 'Digital A3+',
			status: 'Closed',
			statusVariant: 'success' as const
		},
		{
			date: '02 Nov 2026',
			spkCount: '22 SPK',
			grossRevenue: 'Rp 7.800.000',
			cashPaid: 'Rp 7.800.000',
			receivable: 'Rp 0',
			topCategory: 'Large Format',
			status: 'Closed',
			statusVariant: 'success' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Laporan Rekapitulasi Penjualan
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Analisis kinerja omzet, volume pengerjaan SPK, kontribusi kategori produk, dan pelunasan
				piutang.
			</Typography>
		</div>
		<Button variant="outline" size="sm">
			<IconDownload class="mr-1.5 size-4" />
			Export Excel / PDF
		</Button>
	</div>

	<!-- KPI Summary Metrics -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as item (item.title)}
			{@const StatIcon = item.icon}
			<Card class="bg-app-surface shadow-xs">
				<CardContent class="p-4">
					<div class="flex items-center justify-between">
						<span class="text-xs font-medium text-foreground-subtle">{item.title}</span>
						<div
							class="flex size-7 items-center justify-center rounded-md bg-surface-subtle text-foreground-faint"
						>
							<StatIcon class="size-4" />
						</div>
					</div>
					<div class="mt-2 flex items-baseline gap-2">
						<span class="text-xl font-bold tracking-tight text-foreground">{item.value}</span>
					</div>
					<p class="mt-1 text-[11px] text-foreground-faint">{item.subtitle}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Category Revenue Share Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each categoryBreakdown as cat (cat.name)}
			<Card class="bg-app-surface shadow-xs">
				<CardContent class="p-4">
					<span class="text-xs font-medium text-foreground">{cat.name}</span>
					<div class="mt-2 flex items-baseline justify-between">
						<span class="text-sm font-bold text-primary">{cat.revenue}</span>
						<Badge variant="secondary" size="sm">{cat.share}</Badge>
					</div>
					<p class="mt-1 text-[11px] text-foreground-faint">Volume: {cat.qty}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Sales Daily Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Rincian Penjualan Harian
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari tanggal / status..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Tanggal</th>
							<th class="px-4 py-2.5 font-medium">Qty SPK</th>
							<th class="px-4 py-2.5 font-medium">Total Omzet</th>
							<th class="px-4 py-2.5 font-medium">Kas / Transfer Masuk</th>
							<th class="px-4 py-2.5 font-medium">Piutang Baru</th>
							<th class="px-4 py-2.5 font-medium">Kategori Terlaris</th>
							<th class="px-4 py-2.5 font-medium">Status Buku</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleSales as sale (sale.date)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{sale.date}</td>
								<td class="px-4 py-3 font-medium">{sale.spkCount}</td>
								<td class="px-4 py-3 font-bold text-foreground">{sale.grossRevenue}</td>
								<td class="px-4 py-3 text-emerald-600 dark:text-emerald-400">{sale.cashPaid}</td>
								<td class="px-4 py-3 text-rose-600 dark:text-rose-400">{sale.receivable}</td>
								<td class="px-4 py-3 text-foreground-subtle">{sale.topCategory}</td>
								<td class="px-4 py-3">
									<Badge variant={sale.statusVariant} size="sm">
										{sale.status}
									</Badge>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
