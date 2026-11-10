<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconArrowLeft from '~icons/lucide/arrow-left';
	import IconTag from '~icons/lucide/tag';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconLayers from '~icons/lucide/layers';
	import IconPrinter from '~icons/lucide/printer';
	import IconSparkles from '~icons/lucide/sparkles';

	pageTitleStore.set('Katalog Produk');

	const stats = [
		{
			title: 'Total Produk Cetak',
			value: '46 Item',
			subtitle: 'Semua lini produk',
			icon: IconTag
		},
		{
			title: 'Kategori Large Format',
			value: '14 Varian',
			subtitle: 'Outdoor, indoor, backlit',
			icon: IconPrinter
		},
		{
			title: 'Digital Printing A3+',
			value: '22 Varian',
			subtitle: 'Sticker, brosur, art carton',
			icon: IconLayers
		},
		{
			title: 'Sablon DTF & Apparel',
			value: '10 Varian',
			subtitle: 'Meter lari 58cm & 60cm',
			icon: IconSparkles
		}
	];

	const sampleProducts = [
		{
			code: 'PRD-LGF-001',
			name: 'Banner Flexy Outdoor Standar',
			category: 'Large Format',
			baseMaterial: 'Flexy 280 gsm',
			calcModel: 'Per m² (Min. 1.0 m²)',
			basePrice: 'Rp 18.000 / m²',
			status: 'Aktif',
			statusVariant: 'success' as const
		},
		{
			code: 'PRD-LGF-002',
			name: 'Spanduk Flexy Korea Tebal',
			category: 'Large Format',
			baseMaterial: 'Korcin 440 gsm',
			calcModel: 'Per m² (Min. 1.0 m²)',
			basePrice: 'Rp 35.000 / m²',
			status: 'Aktif',
			statusVariant: 'success' as const
		},
		{
			code: 'PRD-A3-010',
			name: 'Sticker Vinyl Glossy A3+ Kiss Cut',
			category: 'Digital A3+',
			baseMaterial: 'Vinyl Putih A3+',
			calcModel: 'Per Lembar Plano + Pola Potong',
			basePrice: 'Rp 12.500 / lbr',
			status: 'Aktif',
			statusVariant: 'success' as const
		},
		{
			code: 'PRD-DTF-001',
			name: 'Sablon DTF Meteran Premium',
			category: 'DTF Printing',
			baseMaterial: 'PET Film 60cm + Powder TPU',
			calcModel: 'Per Meter Lari (100cm x 58cm)',
			basePrice: 'Rp 45.000 / m',
			status: 'Aktif',
			statusVariant: 'success' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header with Back Action -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<a
				href={resolve('/(app)/settings')}
				class="flex size-9 items-center justify-center rounded-lg border border-border bg-app-surface text-foreground-subtle transition-colors hover:bg-surface-subtle hover:text-foreground"
				title="Kembali ke Pengaturan"
			>
				<IconArrowLeft class="size-4" />
			</a>
			<div>
				<Typography variant="h3" as="h1" class="font-bold text-foreground">
					Katalog & Daftar Produk
				</Typography>
				<Typography variant="muted" as="p" class="text-xs text-foreground-subtle sm:text-sm">
					Kelola produk cetak, skema perhitungan (meter persegi, plano A3+, meter lari DTF), dan harga
					dasar.
				</Typography>
			</div>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Tambah Produk Baru
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

	<!-- Products Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Produk & Skema Perhitungan
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari produk / bahan baku..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Kode Produk</th>
							<th class="px-4 py-2.5 font-medium">Nama Produk</th>
							<th class="px-4 py-2.5 font-medium">Kategori</th>
							<th class="px-4 py-2.5 font-medium">Bahan Default</th>
							<th class="px-4 py-2.5 font-medium">Model Perhitungan</th>
							<th class="px-4 py-2.5 font-medium">Harga Dasar (Retail)</th>
							<th class="px-4 py-2.5 font-medium">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleProducts as prd (prd.code)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{prd.code}</td>
								<td class="px-4 py-3 font-medium text-foreground">{prd.name}</td>
								<td class="px-4 py-3">
									<Badge variant="secondary" size="sm">
										{prd.category}
									</Badge>
								</td>
								<td class="px-4 py-3 text-foreground-subtle">{prd.baseMaterial}</td>
								<td class="px-4 py-3 text-foreground-subtle">{prd.calcModel}</td>
								<td class="px-4 py-3 font-semibold text-foreground">{prd.basePrice}</td>
								<td class="px-4 py-3">
									<Badge variant={prd.statusVariant} size="sm">
										{prd.status}
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

