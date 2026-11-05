<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconHandCoins from '~icons/lucide/hand-coins';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconCalendar from '~icons/lucide/calendar';
	import IconCircleAlert from '~icons/lucide/circle-alert';
	import IconCoins from '~icons/lucide/coins';

	pageTitleStore.set('Penarikan Modal (Prive)');

	const stats = [
		{
			title: 'Total Prive Bulan Ini',
			value: 'Rp 12.000.000',
			subtitle: 'Periode November 2026',
			icon: IconHandCoins
		},
		{
			title: 'Total Prive Tahun Ini (YTD)',
			value: 'Rp 68.000.000',
			subtitle: 'Maks. batas dividen tahunan',
			icon: IconCoins
		},
		{
			title: 'Frekuensi Penarikan',
			value: '2 Kali',
			subtitle: 'Bulan berjalan',
			icon: IconCalendar
		},
		{
			title: 'Rasio Terhadap Laba Bersih',
			value: '18.5%',
			subtitle: 'Batas aman likuiditas (< 35%)',
			icon: IconCircleAlert
		}
	];

	const sampleWithdrawals = [
		{
			code: 'PRV-202611-0003',
			date: '02 Nov 2026, 17:00',
			recipient: 'Owner (Bagus Yanuar)',
			sourceAccount: 'BCA Rekening Operasional',
			amount: 'Rp 7.000.000',
			reason: 'Pengambilan laba berjalan awal bulan (Prive Pribadi)',
			status: 'Disetujui',
			statusVariant: 'success' as const
		},
		{
			code: 'PRV-202610-0002',
			date: '25 Okt 2026, 15:30',
			recipient: 'Owner (Bagus Yanuar)',
			sourceAccount: 'BCA Rekening Operasional',
			amount: 'Rp 5.000.000',
			reason: 'Penarikan deviden berkala Q3',
			status: 'Disetujui',
			statusVariant: 'success' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Penarikan Modal Pemilik (Prive)
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Kelola riwayat pengambilan bagian keuntungan (dividen) atau penarikan ekuitas pribadi dari
				kas bisnis.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Catat Penarikan (Prive)
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

	<!-- Withdrawals Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Riwayat Pengambilan Prive
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari transaksi prive..."
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
							<th class="px-4 py-2.5 font-medium">Tanggal Penarikan</th>
							<th class="px-4 py-2.5 font-medium">Penerima Dana</th>
							<th class="px-4 py-2.5 font-medium">Sumber Rekening</th>
							<th class="px-4 py-2.5 font-medium">Keperluan / Keterangan</th>
							<th class="px-4 py-2.5 font-medium">Nominal</th>
							<th class="px-4 py-2.5 font-medium">Status Verifikasi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleWithdrawals as prv (prv.code)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{prv.code}</td>
								<td class="px-4 py-3 text-foreground-subtle">{prv.date}</td>
								<td class="px-4 py-3 font-medium">{prv.recipient}</td>
								<td class="px-4 py-3 text-foreground-subtle">{prv.sourceAccount}</td>
								<td class="px-4 py-3 text-foreground-muted">{prv.reason}</td>
								<td class="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">
									- {prv.amount}
								</td>
								<td class="px-4 py-3">
									<Badge variant={prv.statusVariant} size="sm">
										{prv.status}
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
