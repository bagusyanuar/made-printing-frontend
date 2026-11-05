<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconLandmark from '~icons/lucide/landmark';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconTrendingUp from '~icons/lucide/trending-up';
	import IconShieldCheck from '~icons/lucide/shield-check';
	import IconWallet from '~icons/lucide/wallet';

	pageTitleStore.set('Setoran Modal');

	const stats = [
		{
			title: 'Total Modal Disetor (YTD)',
			value: 'Rp 250.000.000',
			subtitle: 'Tahun buku 2026',
			icon: IconLandmark
		},
		{
			title: 'Setoran Kuartal Ini (Q4)',
			value: 'Rp 50.000.000',
			subtitle: 'Ekspansi mesin DTF 60cm',
			icon: IconTrendingUp
		},
		{
			title: 'Saldo Kas & Bank Utama',
			value: 'Rp 88.450.000',
			subtitle: 'Kas aktif operasional',
			icon: IconWallet
		},
		{
			title: 'Status Audit Ekuitas',
			value: 'Verified',
			subtitle: 'Tercatat dalam neraca permodalan',
			icon: IconShieldCheck
		}
	];

	const sampleDeposits = [
		{
			code: 'DEP-202610-0005',
			date: '15 Okt 2026, 09:30',
			contributor: 'Owner (Bagus Yanuar)',
			targetAccount: 'BCA Rekening Giro Operasional',
			amount: 'Rp 50.000.000',
			notes: 'Penambahan modal kerja untuk pembelian mesin cetak DTF 60cm 4 Head',
			status: 'Tercatat',
			statusVariant: 'success' as const
		},
		{
			code: 'DEP-202607-0004',
			date: '01 Jul 2026, 11:00',
			contributor: 'Owner (Bagus Yanuar)',
			targetAccount: 'Mandiri Bisnis',
			amount: 'Rp 100.000.000',
			notes: 'Suntikan modal ekspansi cabang baru & sewa workshop 2 tahun',
			status: 'Tercatat',
			statusVariant: 'success' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Setoran Modal & Ekuitas Pemilik
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Pencatatan penambahan modal usaha, injeksi likuiditas kas, serta investasi aktiva lancar
				percetakan.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Tambah Setoran Modal
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

	<!-- Capital Deposits Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Riwayat Transaksi Setoran Modal
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari transaksi setoran modal..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Kode Setoran</th>
							<th class="px-4 py-2.5 font-medium">Tanggal Masuk</th>
							<th class="px-4 py-2.5 font-medium">Penyetor (Entitas)</th>
							<th class="px-4 py-2.5 font-medium">Rekening Tujuan</th>
							<th class="px-4 py-2.5 font-medium">Keterangan / Peruntukan</th>
							<th class="px-4 py-2.5 font-medium">Nominal Modal</th>
							<th class="px-4 py-2.5 font-medium">Status Buku</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleDeposits as dep (dep.code)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{dep.code}</td>
								<td class="px-4 py-3 text-foreground-subtle">{dep.date}</td>
								<td class="px-4 py-3 font-medium">{dep.contributor}</td>
								<td class="px-4 py-3 text-foreground-subtle">{dep.targetAccount}</td>
								<td class="px-4 py-3 text-foreground-muted">{dep.notes}</td>
								<td class="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
									+ {dep.amount}
								</td>
								<td class="px-4 py-3">
									<Badge variant={dep.statusVariant} size="sm">
										{dep.status}
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
