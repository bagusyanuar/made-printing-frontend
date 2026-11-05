<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconFileCheck from '~icons/lucide/file-check';
	import IconClock from '~icons/lucide/clock';
	import IconCircleAlert from '~icons/lucide/circle-alert';
	import IconSearch from '~icons/lucide/search';
	import IconDownload from '~icons/lucide/download';

	pageTitleStore.set('Invoice & Tagihan');

	const stats = [
		{
			title: 'Total Tagihan Berjalan',
			value: 'Rp 48.650.000',
			subtitle: 'Bulan November 2026',
			icon: IconFileCheck
		},
		{
			title: 'Menunggu Pelunasan',
			value: 'Rp 14.200.000',
			subtitle: '18 transaksi DP & tempo',
			icon: IconClock
		},
		{
			title: 'Jatuh Tempo (Overdue)',
			value: 'Rp 3.850.000',
			subtitle: '4 reseller melewati TOP',
			icon: IconCircleAlert,
			alert: true
		},
		{
			title: 'Lunas Bulan Ini',
			value: 'Rp 30.600.000',
			subtitle: 'Total pembayaran terverifikasi',
			icon: IconFileCheck
		}
	];

	const sampleInvoices = [
		{
			invoiceNo: 'INV-202611-0082',
			spkNo: 'SPK-202611-0042',
			customer: 'CV Berkah Bersama',
			total: 'Rp 75.000',
			paid: 'Rp 37.500',
			balance: 'Rp 37.500',
			status: 'DP 50%',
			statusVariant: 'warning' as const,
			dueDate: 'Saat Pengambilan'
		},
		{
			invoiceNo: 'INV-202611-0081',
			spkNo: 'SPK-202611-0038',
			customer: 'Mitra Percetakan Jaya',
			total: 'Rp 3.500.000',
			paid: 'Rp 0',
			balance: 'Rp 3.500.000',
			status: 'Tempo 14 Hari',
			statusVariant: 'info' as const,
			dueDate: '18 Nov 2026'
		},
		{
			invoiceNo: 'INV-202611-0080',
			spkNo: 'SPK-202611-0031',
			customer: 'PT Surya Gemilang',
			total: 'Rp 1.850.000',
			paid: 'Rp 1.850.000',
			balance: 'Rp 0',
			status: 'Lunas',
			statusVariant: 'success' as const,
			dueDate: 'Lunas (BCA Transfer)'
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Invoice & Manajemen Penagihan
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Kelola faktur resmi, tracking pembayaran DP, termin piutang reseller, dan kwitansi kasir.
			</Typography>
		</div>
		<Button variant="outline" size="sm">
			<IconDownload class="mr-1.5 size-4" />
			Export Rekap Tagihan
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
							class={`flex size-7 items-center justify-center rounded-md ${
								item.alert
									? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
									: 'bg-surface-subtle text-foreground-faint'
							}`}
						>
							<StatIcon class="size-4" />
						</div>
					</div>
					<div class="mt-2 flex items-baseline gap-2">
						<span
							class={`text-xl font-bold tracking-tight ${
								item.alert ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
							}`}
						>
							{item.value}
						</span>
					</div>
					<p class="mt-1 text-[11px] text-foreground-faint">{item.subtitle}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Invoices Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Invoice & Tagihan Customer
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari nomor invoice / SPK..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Nomor Invoice</th>
							<th class="px-4 py-2.5 font-medium">No. SPK Terkait</th>
							<th class="px-4 py-2.5 font-medium">Pelanggan</th>
							<th class="px-4 py-2.5 font-medium">Total Tagihan</th>
							<th class="px-4 py-2.5 font-medium">Terbayar</th>
							<th class="px-4 py-2.5 font-medium">Sisa Piutang</th>
							<th class="px-4 py-2.5 font-medium">Jatuh Tempo</th>
							<th class="px-4 py-2.5 font-medium">Status Pembayaran</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleInvoices as inv (inv.invoiceNo)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{inv.invoiceNo}</td>
								<td class="px-4 py-3 font-mono text-foreground-subtle">{inv.spkNo}</td>
								<td class="px-4 py-3 font-medium">{inv.customer}</td>
								<td class="px-4 py-3 font-semibold">{inv.total}</td>
								<td class="px-4 py-3 text-emerald-600 dark:text-emerald-400">{inv.paid}</td>
								<td class="px-4 py-3 font-medium text-foreground-subtle">{inv.balance}</td>
								<td class="px-4 py-3 text-foreground-subtle">{inv.dueDate}</td>
								<td class="px-4 py-3">
									<Badge variant={inv.statusVariant} size="sm">
										{inv.status}
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
