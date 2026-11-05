<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconTrendingDown from '~icons/lucide/trending-down';
	import IconDownload from '~icons/lucide/download';
	import IconSearch from '~icons/lucide/search';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconPieChart from '~icons/lucide/pie-chart';
	import IconPercent from '~icons/lucide/percent';

	pageTitleStore.set('Laporan Pengeluaran');

	const stats = [
		{
			title: 'Total Beban Pengeluaran (MTD)',
			value: 'Rp 28.450.000',
			subtitle: 'Periode November 2026',
			icon: IconTrendingDown
		},
		{
			title: 'Beban Pokok Penjualan (HPP)',
			value: 'Rp 18.200.000',
			subtitle: 'Bahan roll, plano, tinta',
			icon: IconCreditCard
		},
		{
			title: 'Beban Operasional (OPEX)',
			value: 'Rp 10.250.000',
			subtitle: 'Gaji, listrik, sewa, maintenance',
			icon: IconPieChart
		},
		{
			title: 'Rasio Beban terhadap Omzet',
			value: '41.5%',
			subtitle: 'Target batas aman (< 45%)',
			icon: IconPercent
		}
	];

	const expenseCategories = [
		{ name: 'Bahan Baku Cetak (Roll & Plano)', amount: 'Rp 14.500.000', percentage: '51.0%' },
		{ name: 'Tinta & Cairan Pembersih Mesin', amount: 'Rp 3.700.000', percentage: '13.0%' },
		{ name: 'Listrik Workshop (3-Phase PLN)', amount: 'Rp 4.250.000', percentage: '14.9%' },
		{ name: 'Gaji & Upah Lembur Operator', amount: 'Rp 4.500.000', percentage: '15.8%' },
		{ name: 'Perawatan & Servis Mesin Cetak', amount: 'Rp 1.500.000', percentage: '5.3%' }
	];

	const sampleMonthlyExpenses = [
		{
			month: 'November 2026 (Berjalan)',
			rawMaterials: 'Rp 18.200.000',
			utilities: 'Rp 4.250.000',
			salaries: 'Rp 4.500.000',
			maintenance: 'Rp 1.500.000',
			total: 'Rp 28.450.000',
			status: 'Berjalan',
			statusVariant: 'warning' as const
		},
		{
			month: 'Oktober 2026',
			rawMaterials: 'Rp 31.400.000',
			utilities: 'Rp 4.800.000',
			salaries: 'Rp 8.000.000',
			maintenance: 'Rp 2.100.000',
			total: 'Rp 46.300.000',
			status: 'Final / Audited',
			statusVariant: 'success' as const
		},
		{
			month: 'September 2026',
			rawMaterials: 'Rp 29.100.000',
			utilities: 'Rp 4.600.000',
			salaries: 'Rp 7.800.000',
			maintenance: 'Rp 1.200.000',
			total: 'Rp 42.700.000',
			status: 'Final / Audited',
			statusVariant: 'success' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Laporan Beban & Pengeluaran
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Rincian pos pengeluaran operasional, evaluasi HPP bahan baku, konsumsi listrik, dan biaya
				permesinan.
			</Typography>
		</div>
		<Button variant="outline" size="sm">
			<IconDownload class="mr-1.5 size-4" />
			Export Laporan Beban
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

	<!-- Expense Breakdown Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">
				Distribusi Beban Pengeluaran per Kategori
			</CardTitle>
		</CardHeader>
		<CardContent class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
			{#each expenseCategories as cat (cat.name)}
				<div class="rounded-lg border border-border bg-canvas p-3">
					<span class="text-[11px] text-foreground-subtle">{cat.name}</span>
					<div class="mt-2 flex items-baseline justify-between">
						<span class="text-xs font-bold text-foreground">{cat.amount}</span>
						<Badge variant="secondary" size="sm">{cat.percentage}</Badge>
					</div>
				</div>
			{/each}
		</CardContent>
	</Card>

	<!-- Monthly Comparison Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Perbandingan Pengeluaran Bulanan
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari bulan..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Bulan Periode</th>
							<th class="px-4 py-2.5 font-medium">HPP Bahan Baku</th>
							<th class="px-4 py-2.5 font-medium">Listrik & Utilitas</th>
							<th class="px-4 py-2.5 font-medium">Gaji & Upah</th>
							<th class="px-4 py-2.5 font-medium">Maintenance</th>
							<th class="px-4 py-2.5 font-medium">Total Pengeluaran</th>
							<th class="px-4 py-2.5 font-medium">Status Buku</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleMonthlyExpenses as m (m.month)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{m.month}</td>
								<td class="px-4 py-3 text-foreground-subtle">{m.rawMaterials}</td>
								<td class="px-4 py-3 text-foreground-subtle">{m.utilities}</td>
								<td class="px-4 py-3 text-foreground-subtle">{m.salaries}</td>
								<td class="px-4 py-3 text-foreground-subtle">{m.maintenance}</td>
								<td class="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">{m.total}</td>
								<td class="px-4 py-3">
									<Badge variant={m.statusVariant} size="sm">
										{m.status}
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
