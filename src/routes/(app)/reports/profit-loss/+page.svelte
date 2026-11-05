<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconScale from '~icons/lucide/scale';
	import IconDownload from '~icons/lucide/download';
	import IconTrendingUp from '~icons/lucide/trending-up';
	import IconPercent from '~icons/lucide/percent';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';

	pageTitleStore.set('Laporan Laba Rugi');

	const stats = [
		{
			title: 'Total Pendapatan Bersih',
			value: 'Rp 68.450.000',
			subtitle: 'Periode berjalan MTD',
			icon: IconTrendingUp
		},
		{
			title: 'Laba Kotor (Gross Profit)',
			value: 'Rp 50.250.000',
			subtitle: 'Gross margin: 73.4%',
			icon: IconPercent
		},
		{
			title: 'Total Beban OPEX',
			value: 'Rp 10.250.000',
			subtitle: 'Beban operasional & utilitas',
			icon: IconScale
		},
		{
			title: 'Laba Bersih Usaha (Net Profit)',
			value: 'Rp 40.000.000',
			subtitle: 'Net margin sehat: 58.4%',
			icon: IconCheckCircle2
		}
	];

	const plStatement = [
		{
			group: 'Pendapatan Usaha (Revenue)',
			items: [
				{ name: 'Penjualan Percetakan Large Format', value: 'Rp 36.800.000' },
				{ name: 'Penjualan Digital Printing Sheetfed A3+', value: 'Rp 18.250.000' },
				{ name: 'Penjualan Sablon DTF & Merchandise', value: 'Rp 13.400.000' }
			],
			subtotalLabel: 'Total Pendapatan Usaha',
			subtotalValue: 'Rp 68.450.000',
			highlight: false
		},
		{
			group: 'Harga Pokok Penjualan (HPP)',
			items: [
				{ name: 'Pemakaian Bahan Roll (Flexy, Albatros, Korcin)', value: 'Rp (11.200.000)' },
				{ name: 'Pemakaian Kertas Plano (Art Carton, Vinyl A3+)', value: 'Rp (3.300.000)' },
				{ name: 'Konsumsi Tinta Mesin (Solvent, Eco, UV, Toner)', value: 'Rp (3.700.000)' }
			],
			subtotalLabel: 'Total HPP',
			subtotalValue: 'Rp (18.200.000)',
			highlight: false
		},
		{
			group: 'Laba Kotor (Gross Profit)',
			items: [],
			subtotalLabel: 'Total Laba Kotor',
			subtotalValue: 'Rp 50.250.000 (Margin 73.4%)',
			highlight: true
		},
		{
			group: 'Beban Usaha & Operasional (OPEX)',
			items: [
				{ name: 'Beban Listrik 3-Phase & Utilitas Workshop', value: 'Rp (4.250.000)' },
				{ name: 'Gaji Pokok & Upah Operator Produksi', value: 'Rp (4.500.000)' },
				{ name: 'Pemeliharaan & Servis Head Mesin Cetak', value: 'Rp (1.500.000)' }
			],
			subtotalLabel: 'Total Beban Usaha',
			subtotalValue: 'Rp (10.250.000)',
			highlight: false
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Laporan Laba Rugi (Income Statement)
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Evaluasi profitabilitas usaha percetakan, kalkulasi margin kotor, dan laba bersih
				operasional.
			</Typography>
		</div>
		<Button variant="outline" size="sm">
			<IconDownload class="mr-1.5 size-4" />
			Export Laporan Laba Rugi
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

	<!-- Income Statement Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Laporan Laba Rugi Komprehensif
			</CardTitle>
			<Badge variant="secondary" size="sm">Periode: 01 Nov - 05 Nov 2026</Badge>
		</CardHeader>
		<CardContent class="flex flex-col gap-5 p-6">
			{#each plStatement as section (section.group)}
				<div class="rounded-lg border border-border bg-canvas p-4">
					<span class="text-xs font-bold text-foreground">{section.group}</span>
					{#if section.items.length > 0}
						<div class="mt-2 divide-y divide-border/60">
							{#each section.items as row (row.name)}
								<div class="flex items-center justify-between py-1.5 text-xs">
									<span class="text-foreground-muted">{row.name}</span>
									<span class="font-mono text-foreground">{row.value}</span>
								</div>
							{/each}
						</div>
					{/if}
					<div
						class="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs font-bold"
					>
						<span class="text-foreground">{section.subtotalLabel}</span>
						<span class={section.highlight ? 'text-primary' : 'text-foreground'}>
							{section.subtotalValue}
						</span>
					</div>
				</div>
			{/each}

			<!-- Bottom Line Net Income -->
			<div class="flex items-center justify-between rounded-lg bg-primary/10 p-4">
				<div>
					<span class="text-sm font-bold text-primary">Laba Bersih Periode Berjalan (EAT)</span>
					<p class="text-[11px] text-foreground-subtle">
						Setelah dikurangi seluruh HPP dan Beban Usaha
					</p>
				</div>
				<span class="text-lg font-bold text-primary">Rp 40.000.000</span>
			</div>
		</CardContent>
	</Card>
</div>
