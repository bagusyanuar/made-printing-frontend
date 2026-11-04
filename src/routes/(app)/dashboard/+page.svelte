<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconPrinter from '~icons/lucide/printer';
	import IconFileText from '~icons/lucide/file-text';
	import IconScissors from '~icons/lucide/scissors';
	import IconTrendingUp from '~icons/lucide/trending-up';
	import IconClock from '~icons/lucide/clock';
	import IconPlus from '~icons/lucide/plus';
	import IconCircleAlert from '~icons/lucide/circle-alert';

	pageTitleStore.set('Dashboard Overview');

	const stats = [
		{
			title: 'Total SPK Hari Ini',
			value: '42',
			subtitle: '+8 SPK dari kemarin',
			icon: IconFileText,
			trend: 'up'
		},
		{
			title: 'Sedang Dicetak',
			value: '14',
			subtitle: 'Di 4 mesin aktif',
			icon: IconPrinter,
			trend: 'neutral'
		},
		{
			title: 'Antrean Finishing',
			value: '9',
			subtitle: 'Mata ayam, laminasi, die cut',
			icon: IconScissors,
			trend: 'neutral'
		},
		{
			title: 'Omzet Penjualan',
			value: 'Rp 16.450.000',
			subtitle: 'Target harian: Rp 15.000.000',
			icon: IconTrendingUp,
			trend: 'up'
		}
	];

	const activeQueues = [
		{
			spk: 'SPK-2026-0341',
			customer: 'PT Surya Gemilang (Reseller)',
			product: 'Banner Flexi Korea 440g (3x1 m)',
			machine: 'Roland Soljet Pro IV',
			finishing: 'Mata Ayam 4 Pojok + Seaming',
			status: 'PRODUKSI',
			badgeVariant: 'default' as const,
			priority: 'URGENT'
		},
		{
			spk: 'SPK-2026-0342',
			customer: 'CV Berkah Grafika',
			product: 'Brosur Art Paper 150g (A3+ 2 Sisi)',
			machine: 'Konica Minolta AccurioPress',
			finishing: 'Laminasi Doff 2 Muka + Lipat 3',
			status: 'PRE_PRESS',
			badgeVariant: 'secondary' as const,
			priority: 'NORMAL'
		},
		{
			spk: 'SPK-2026-0343',
			customer: 'Warung Kopi Senja',
			product: 'Stiker Vinyl Ritrama + Kiss Cut',
			machine: 'Mimaki UCJV300-160',
			finishing: 'Kiss Cut Cutting Plotter',
			status: 'FINISHING',
			badgeVariant: 'outline' as const,
			priority: 'NORMAL'
		},
		{
			spk: 'SPK-2026-0344',
			customer: 'Distro Apparel Bandung',
			product: 'Sablon DTF Pet Film 60cm (12 m)',
			machine: 'Mesin DTF Dual Head i3200',
			finishing: 'Powder Shaker & Curing Heat',
			status: 'MENUNGGU_BAHAN',
			badgeVariant: 'danger' as const,
			priority: 'URGENT'
		}
	];

	const machines = [
		{
			name: 'Roland Soljet Pro IV',
			type: 'Outdoor / Large Format (3.2m)',
			status: 'Cetak Berjalan',
			load: '78%',
			activeSpk: 'SPK-2026-0341'
		},
		{
			name: 'Konica Minolta C4070',
			type: 'Digital Sheetfed A3+',
			status: 'Siap Produksi',
			load: '40%',
			activeSpk: 'Antrean berikutnya'
		},
		{
			name: 'Mimaki UCJV300-160',
			type: 'UV Roll-to-Roll & Print-Cut',
			status: 'Cetak Berjalan',
			load: '92%',
			activeSpk: 'SPK-2026-0343'
		},
		{
			name: 'DTF Dual Head i3200',
			type: 'Direct to Film 60cm',
			status: 'Standby / Pemanasan',
			load: '15%',
			activeSpk: 'Menunggu Antrean'
		}
	];
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header Actions -->
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Ringkasan Operasional Percetakan
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Pantau antrean SPK, beban mesin cetak, dan status finishing secara langsung.
			</Typography>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm">
				<IconClock class="mr-1.5 size-4" />
				Riwayat Cetak
			</Button>
			<Button size="sm">
				<IconPlus class="mr-1.5 size-4" />
				Buat SPK Baru
			</Button>
		</div>
	</div>

	<!-- Top Metrics -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as item (item.title)}
			{@const StatIcon = item.icon}
			<Card class="bg-app-surface shadow-xs">
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-xs font-medium text-foreground-subtle">
						{item.title}
					</CardTitle>
					<div
						class="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary"
					>
						<StatIcon class="size-4" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-foreground">{item.value}</div>
					<p class="mt-1 text-xs text-foreground-muted">{item.subtitle}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Main 2-column Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Left 2 cols: Live SPK Queue -->
		<div class="flex flex-col gap-4 lg:col-span-2">
			<Card class="bg-app-surface shadow-xs">
				<CardHeader class="flex flex-row items-center justify-between">
					<div>
						<CardTitle class="text-base font-semibold text-foreground">Antrean SPK Aktif</CardTitle>
						<p class="text-xs text-foreground-subtle">
							Daftar pekerjaan masuk yang sedang diproses di lantai produksi.
						</p>
					</div>
					<Badge variant="outline" class="text-xs">
						{activeQueues.length} Pesanan Berjalan
					</Badge>
				</CardHeader>

				<CardContent class="p-0">
					<div class="divide-y divide-border overflow-x-auto">
						{#each activeQueues as order (order.spk)}
							<div
								class="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-hover"
							>
								<div class="flex min-w-0 flex-1 flex-col gap-1">
									<div class="flex items-center gap-2">
										<span class="font-mono text-sm font-semibold text-primary">
											{order.spk}
										</span>
										{#if order.priority === 'URGENT'}
											<span
												class="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400"
											>
												URGENT
											</span>
										{/if}
									</div>
									<p class="truncate text-sm font-medium text-foreground">
										{order.product}
									</p>
									<div class="flex flex-wrap items-center gap-2 text-xs text-foreground-subtle">
										<span>Pelanggan: {order.customer}</span>
										<span>&bull;</span>
										<span>Mesin: {order.machine}</span>
										<span>&bull;</span>
										<span>Finishing: {order.finishing}</span>
									</div>
								</div>

								<div class="shrink-0 text-right">
									<Badge variant={order.badgeVariant} class="text-[11px]">
										{order.status}
									</Badge>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Right 1 col: Machine Status -->
		<div class="flex flex-col gap-4">
			<Card class="bg-app-surface shadow-xs">
				<CardHeader>
					<CardTitle class="text-base font-semibold text-foreground">
						Status Mesin Percetakan
					</CardTitle>
					<p class="text-xs text-foreground-subtle">Kapasitas beban kerja mesin per jam ini.</p>
				</CardHeader>

				<CardContent class="flex flex-col gap-4">
					{#each machines as m (m.name)}
						<div
							class="flex flex-col gap-1.5 rounded-lg border border-border p-3 transition-colors hover:bg-surface-hover"
						>
							<div class="flex items-center justify-between">
								<span class="text-sm font-semibold text-foreground">{m.name}</span>
								<span class="font-mono text-xs font-medium text-primary">{m.load}</span>
							</div>
							<span class="text-xs text-foreground-subtle">{m.type}</span>

							<div class="mt-1 flex items-center justify-between text-xs">
								<div class="flex items-center gap-1.5">
									<span class="size-2 rounded-full bg-emerald-500"></span>
									<span class="font-medium text-foreground-soft">{m.status}</span>
								</div>
								<span class="font-mono text-[11px] text-foreground-muted">{m.activeSpk}</span>
							</div>
						</div>
					{/each}
				</CardContent>
			</Card>

			<!-- Quick Notice Card -->
			<Card class="border-amber-500/20 bg-amber-500/5 shadow-xs dark:bg-amber-500/10">
				<CardContent class="flex items-start gap-3 p-4">
					<IconCircleAlert class="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
					<div class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-amber-900 dark:text-amber-200">
							Pemberitahuan Bahan Baku
						</span>
						<p class="text-xs text-amber-800/90 dark:text-amber-300/80">
							Stok Pet Film DTF 60cm tersisa 2 roll (estimasi habis sore ini). Segera lakukan
							restock order ke supplier.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
