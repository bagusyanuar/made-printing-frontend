<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconBanknote from '~icons/lucide/banknote';
	import IconDownload from '~icons/lucide/download';
	import IconWallet from '~icons/lucide/wallet';
	import IconTrendingUp from '~icons/lucide/trending-up';
	import IconTrendingDown from '~icons/lucide/trending-down';

	pageTitleStore.set('Laporan Arus Kas');

	const stats = [
		{
			title: 'Saldo Kas Awal Periode',
			value: 'Rp 45.200.000',
			subtitle: 'Per 01 November 2026',
			icon: IconWallet
		},
		{
			title: 'Total Arus Kas Masuk (Inflow)',
			value: 'Rp 78.450.000',
			subtitle: 'Penjualan tunai, piutang, modal',
			icon: IconTrendingUp
		},
		{
			title: 'Total Arus Kas Keluar (Outflow)',
			value: 'Rp 40.450.000',
			subtitle: 'Bahan, listrik, maintenance, prive',
			icon: IconTrendingDown
		},
		{
			title: 'Saldo Kas Akhir Periode',
			value: 'Rp 83.200.000',
			subtitle: 'Kas di tangan + rekening bank',
			icon: IconBanknote
		}
	];

	const cashFlowSections = [
		{
			title: '1. Arus Kas dari Aktivitas Operasional',
			items: [
				{
					label: 'Penerimaan Kas dari Penjualan Tunai / POS',
					amount: 'Rp 38.600.000',
					isPositive: true
				},
				{
					label: 'Penerimaan Pelunasan Piutang Reseller & Korporat',
					amount: 'Rp 15.650.000',
					isPositive: true
				},
				{
					label: 'Pembayaran Bahan Baku & Tinta Cetak',
					amount: 'Rp (18.200.000)',
					isPositive: false
				},
				{
					label: 'Pembayaran Utilitas, Listrik & Gaji Operator',
					amount: 'Rp (10.250.000)',
					isPositive: false
				}
			],
			netAmount: 'Rp +25.800.000',
			netPositive: true
		},
		{
			title: '2. Arus Kas dari Aktivitas Investasi',
			items: [
				{
					label: 'Uang Muka Pembelian Mesin DTF 60cm 4 Head',
					amount: 'Rp (20.000.000)',
					isPositive: false
				},
				{
					label: 'Upgrade Unit PC RIP Desain Pre-press',
					amount: 'Rp (4.500.000)',
					isPositive: false
				}
			],
			netAmount: 'Rp (24.500.000)',
			netPositive: false
		},
		{
			title: '3. Arus Kas dari Aktivitas Pendanaan',
			items: [
				{
					label: 'Setoran Tambahan Modal Kerja Pemilik',
					amount: 'Rp 50.000.000',
					isPositive: true
				},
				{
					label: 'Penarikan Bagian Laba Pemilik (Prive)',
					amount: 'Rp (13.300.000)',
					isPositive: false
				}
			],
			netAmount: 'Rp +36.700.000',
			netPositive: true
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Laporan Arus Kas (Cash Flow Statement)
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Pelaporan mutasi kas masuk dan kas keluar dari pos operasional, investasi mesin, serta
				permodalan.
			</Typography>
		</div>
		<Button variant="outline" size="sm">
			<IconDownload class="mr-1.5 size-4" />
			Export Laporan Arus Kas
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

	<!-- Cash Flow Statement Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">
				Laporan Arus Kas Periode Berjalan (Metode Langsung)
			</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col gap-6 p-6">
			{#each cashFlowSections as section (section.title)}
				<div class="flex flex-col gap-2 rounded-lg border border-border bg-canvas p-4">
					<div class="flex items-center justify-between border-b border-border pb-2">
						<span class="text-xs font-bold text-foreground">{section.title}</span>
						<Badge variant={section.netPositive ? 'success' : 'danger'} size="sm">
							Net: {section.netAmount}
						</Badge>
					</div>

					<div class="divide-y divide-border/60">
						{#each section.items as item (item.label)}
							<div class="flex items-center justify-between py-2 text-xs">
								<span class="text-foreground-muted">{item.label}</span>
								<span
									class={`font-mono font-medium ${
										item.isPositive
											? 'text-emerald-600 dark:text-emerald-400'
											: 'text-rose-600 dark:text-rose-400'
									}`}
								>
									{item.amount}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<div class="flex items-center justify-between rounded-lg bg-surface-subtle p-4">
				<span class="text-sm font-bold text-foreground"
					>Kenaikan Bersih Kas & Setara Kas Periode Ini</span
				>
				<span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
					Rp +38.000.000
				</span>
			</div>
		</CardContent>
	</Card>
</div>
