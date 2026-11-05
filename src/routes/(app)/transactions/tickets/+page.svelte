<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconTicket from '~icons/lucide/ticket';
	import IconPlus from '~icons/lucide/plus';
	import IconClock from '~icons/lucide/clock';
	import IconPrinter from '~icons/lucide/printer';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconSearch from '~icons/lucide/search';

	pageTitleStore.set('Tiket Pesanan');

	const stats = [
		{
			title: 'Tiket Aktif',
			value: '38',
			subtitle: 'SPK dalam antrean kerja',
			icon: IconTicket
		},
		{
			title: 'Menunggu Desain / RIP',
			value: '7',
			subtitle: 'Pra-cetak & verifikasi bleed',
			icon: IconClock
		},
		{
			title: 'Sedang Cetak & Finishing',
			value: '19',
			subtitle: 'Mesin outdoor & A3+',
			icon: IconPrinter
		},
		{
			title: 'Siap Diambil',
			value: '12',
			subtitle: 'Sudah lolos Quality Control',
			icon: IconCheckCircle2
		}
	];

	const sampleTickets = [
		{
			spk: 'SPK-202611-0042',
			customer: 'CV Berkah Bersama',
			product: 'Banner Flexy 340g (3m x 1m)',
			finishing: 'Mata ayam 4 pojok',
			deadline: 'Hari ini, 15:00',
			status: 'Sedang Cetak',
			statusVariant: 'info' as const,
			priority: 'Express',
			isUrgent: true
		},
		{
			spk: 'SPK-202611-0041',
			customer: 'Warung Bu Trisno',
			product: 'Sticker Vinyl A3+ Kiss Cut',
			finishing: 'Laminasi Doff',
			deadline: 'Hari ini, 17:30',
			status: 'Antrean Finishing',
			statusVariant: 'warning' as const,
			priority: 'Reguler',
			isUrgent: false
		},
		{
			spk: 'SPK-202611-0040',
			customer: 'PT Surya Gemilang',
			product: 'Brosur Art Paper 150g (4/4)',
			finishing: 'Lipat 3 (Letter Fold)',
			deadline: 'Besok, 12:00',
			status: 'Siap Diambil',
			statusVariant: 'success' as const,
			priority: 'Reguler',
			isUrgent: false
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Tiket Pesanan & Surat Perintah Kerja (SPK)
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Pantau seluruh antrean tiket pesanan masuk, alur status produksi, dan deadline pengerjaan.
			</Typography>
		</div>
		<Button size="sm">
			{#snippet child({ props })}
				<a {...props} href={resolve('/(app)/transactions/new')}>
					<IconPlus class="mr-1.5 size-4" />
					Pesanan Baru
				</a>
			{/snippet}
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
						<span class="text-2xl font-bold tracking-tight text-foreground">{item.value}</span>
					</div>
					<p class="mt-1 text-[11px] text-foreground-faint">{item.subtitle}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Main Ticket List Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Tiket Pesanan Masuk
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari nomor SPK / nama customer..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Nomor SPK</th>
							<th class="px-4 py-2.5 font-medium">Pelanggan</th>
							<th class="px-4 py-2.5 font-medium">Spesifikasi Item</th>
							<th class="px-4 py-2.5 font-medium">Finishing</th>
							<th class="px-4 py-2.5 font-medium">Target Deadline</th>
							<th class="px-4 py-2.5 font-medium">Prioritas</th>
							<th class="px-4 py-2.5 font-medium">Status Produksi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleTickets as ticket (ticket.spk)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{ticket.spk}</td>
								<td class="px-4 py-3 font-medium">{ticket.customer}</td>
								<td class="px-4 py-3 text-foreground-muted">{ticket.product}</td>
								<td class="px-4 py-3 text-foreground-subtle">{ticket.finishing}</td>
								<td class="px-4 py-3 text-foreground-subtle">{ticket.deadline}</td>
								<td class="px-4 py-3">
									{#if ticket.isUrgent}
										<Badge variant="danger" size="sm">
											{ticket.priority}
										</Badge>
									{:else}
										<Badge variant="secondary" size="sm">
											{ticket.priority}
										</Badge>
									{/if}
								</td>
								<td class="px-4 py-3">
									<Badge variant={ticket.statusVariant} size="sm">
										{ticket.status}
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
