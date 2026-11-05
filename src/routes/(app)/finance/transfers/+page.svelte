<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconArrowLeftRight from '~icons/lucide/arrow-left-right';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconClock from '~icons/lucide/clock';
	import IconBuilding2 from '~icons/lucide/building-2';

	pageTitleStore.set('Pemindahan Dana');

	const stats = [
		{
			title: 'Mutasi Dana Bulan Ini',
			value: 'Rp 64.300.000',
			subtitle: '14 transaksi pemindahan',
			icon: IconArrowLeftRight
		},
		{
			title: 'Setoran Kasir ke Bank',
			value: 'Rp 41.500.000',
			subtitle: 'Kas fisik masuk ke BCA/Mandiri',
			icon: IconBuilding2
		},
		{
			title: 'Mutasi Selesai (Reconciled)',
			value: '13',
			subtitle: 'Sesuai dengan mutasi koran',
			icon: IconCheckCircle2
		},
		{
			title: 'Menunggu Rekonsiliasi Bank',
			value: '1',
			subtitle: 'Setoran kliring / pending',
			icon: IconClock
		}
	];

	const sampleTransfers = [
		{
			code: 'TRF-202611-0012',
			date: '04 Nov 2026, 21:00',
			fromAccount: 'Kasir Meja 1 (Tunai)',
			toAccount: 'BCA Giro Operasional',
			amount: 'Rp 8.500.000',
			fee: 'Rp 0',
			notes: 'Setoran akhir shift kasir harian',
			status: 'Selesai',
			statusVariant: 'success' as const
		},
		{
			code: 'TRF-202611-0011',
			date: '03 Nov 2026, 09:15',
			fromAccount: 'BCA Giro Operasional',
			toAccount: 'Kas Kecil (Petty Cash)',
			amount: 'Rp 2.000.000',
			fee: 'Rp 0',
			notes: 'Top-up saldo petty cash awal bulan untuk konsumsi & operasional kecil',
			status: 'Selesai',
			statusVariant: 'success' as const
		},
		{
			code: 'TRF-202611-0010',
			date: '01 Nov 2026, 14:00',
			fromAccount: 'Mandiri Bisnis',
			toAccount: 'BCA Giro Operasional',
			amount: 'Rp 15.000.000',
			fee: 'Rp 2.500',
			notes: 'Konsolidasi saldo pembayaran QRIS Mandiri ke rekening utama',
			status: 'Selesai',
			statusVariant: 'success' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Pemindahan Dana & Mutasi Antar Kas
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Catat transfer antar rekening bank perusahaan, setoran uang tunai kasir harian, dan top-up
				kas kecil.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Transfer Dana Baru
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

	<!-- Transfers Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Riwayat Mutasi & Pemindahan Dana
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari mutasi transfer..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Kode Mutasi</th>
							<th class="px-4 py-2.5 font-medium">Tanggal</th>
							<th class="px-4 py-2.5 font-medium">Dari Akun</th>
							<th class="px-4 py-2.5 font-medium">Ke Akun</th>
							<th class="px-4 py-2.5 font-medium">Keterangan</th>
							<th class="px-4 py-2.5 font-medium">Biaya Admin</th>
							<th class="px-4 py-2.5 font-medium">Nominal Mutasi</th>
							<th class="px-4 py-2.5 font-medium">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleTransfers as trf (trf.code)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{trf.code}</td>
								<td class="px-4 py-3 text-foreground-subtle">{trf.date}</td>
								<td class="px-4 py-3 font-medium text-foreground">{trf.fromAccount}</td>
								<td class="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
									&rarr; {trf.toAccount}
								</td>
								<td class="px-4 py-3 text-foreground-muted">{trf.notes}</td>
								<td class="px-4 py-3 text-foreground-subtle">{trf.fee}</td>
								<td class="px-4 py-3 font-semibold text-foreground">{trf.amount}</td>
								<td class="px-4 py-3">
									<Badge variant={trf.statusVariant} size="sm">
										{trf.status}
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
