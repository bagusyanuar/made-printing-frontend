<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconReceipt from '~icons/lucide/receipt';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconWrench from '~icons/lucide/wrench';
	import IconFuel from '~icons/lucide/fuel';

	pageTitleStore.set('Pengeluaran');

	const stats = [
		{
			title: 'Total Pengeluaran Bulan Ini',
			value: 'Rp 24.850.000',
			subtitle: 'Periode November 2026',
			icon: IconReceipt
		},
		{
			title: 'Bahan Baku & Tinta',
			value: 'Rp 16.200.000',
			subtitle: 'Roll flexy, art carton, tinta UV/Eco',
			icon: IconCreditCard
		},
		{
			title: 'Operasional & Listrik Workshop',
			value: 'Rp 5.750.000',
			subtitle: 'Listrik 3-phase, air, internet',
			icon: IconFuel
		},
		{
			title: 'Maintenance & Sparepart',
			value: 'Rp 2.900.000',
			subtitle: 'Cleaning solvent & sparepart head',
			icon: IconWrench
		}
	];

	const sampleExpenses = [
		{
			code: 'EXP-202611-0021',
			date: '04 Nov 2026, 14:20',
			category: 'Bahan Baku',
			description: 'Pembelian 2 Roll Flexy Korea 440g lebar 3.2m',
			account: 'BCA Operasional',
			amount: 'Rp 4.200.000',
			status: 'Disetujui',
			statusVariant: 'success' as const
		},
		{
			code: 'EXP-202611-0020',
			date: '03 Nov 2026, 10:15',
			category: 'Maintenance',
			description: 'Service rutin mesin cetak Konica Minolta A3+',
			account: 'Kasir Tunai',
			amount: 'Rp 750.000',
			status: 'Disetujui',
			statusVariant: 'success' as const
		},
		{
			code: 'EXP-202611-0019',
			date: '02 Nov 2026, 16:45',
			category: 'Operasional',
			description: 'Konsumsi lembur operator SPK Pilkada',
			account: 'Kas Kecil (Petty Cash)',
			amount: 'Rp 250.000',
			status: 'Disetujui',
			statusVariant: 'success' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Pengeluaran & Beban Operasional
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Catat dan pantau seluruh pos pengeluaran kas, belanja material darurat, listrik, serta biaya
				perawatan mesin.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Catat Pengeluaran Baru
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

	<!-- Expenses Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Riwayat Pengeluaran Kas & Bank
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari transaksi / keterangan..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Kode Transaksi</th>
							<th class="px-4 py-2.5 font-medium">Tanggal & Jam</th>
							<th class="px-4 py-2.5 font-medium">Kategori</th>
							<th class="px-4 py-2.5 font-medium">Keterangan</th>
							<th class="px-4 py-2.5 font-medium">Sumber Dana</th>
							<th class="px-4 py-2.5 font-medium">Nominal</th>
							<th class="px-4 py-2.5 font-medium">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleExpenses as exp (exp.code)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{exp.code}</td>
								<td class="px-4 py-3 text-foreground-subtle">{exp.date}</td>
								<td class="px-4 py-3">
									<Badge variant="secondary" size="sm">
										{exp.category}
									</Badge>
								</td>
								<td class="px-4 py-3 font-medium">{exp.description}</td>
								<td class="px-4 py-3 text-foreground-subtle">{exp.account}</td>
								<td class="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
									- {exp.amount}
								</td>
								<td class="px-4 py-3">
									<Badge variant={exp.statusVariant} size="sm">
										{exp.status}
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
