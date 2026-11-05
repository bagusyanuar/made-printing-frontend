<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconPackage from '~icons/lucide/package';
	import IconWrench from '~icons/lucide/wrench';
	import IconSparkles from '~icons/lucide/sparkles';
	import IconStore from '~icons/lucide/store';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconArrowRight from '~icons/lucide/arrow-right';

	pageTitleStore.set('Pengaturan Sistem');

	const masterDataModules = [
		{
			title: 'Katalog Bahan Baku',
			description:
				'Daftar bahan roll (Flexy, Korcin, Albatros) dan lembaran plano (Art Carton, Vinyl A3+), harga beli modal, dan stok.',
			href: resolve('/(app)/master/materials'),
			badge: '18 Bahan Baku',
			icon: IconPackage
		},
		{
			title: 'Mesin Percetakan',
			description:
				'Daftar armada mesin cetak Large Format Outdoor/Indoor, Digital Laser A3+, DTF, kapasitas cetak (m²/jam), dan click count.',
			href: resolve('/(app)/master/machines'),
			badge: '6 Mesin Aktif',
			icon: IconWrench
		},
		{
			title: 'Layanan Finishing',
			description:
				'Katalog jenis pengerjaan pasca cetak: mata ayam (grommet), seaming/lipat lem, potong pas gambar, laminasi, dan pond.',
			href: resolve('/(app)/master/finishings'),
			badge: '12 Layanan',
			icon: IconSparkles
		},
		{
			title: 'Profil Percetakan & Toko',
			description:
				'Identitas usaha percetakan, nomor WhatsApp CS, alamat workshop, serta kop dokumen untuk cetak SPK & Nota Kasir.',
			href: '#',
			badge: 'Made Printing',
			icon: IconStore
		},
		{
			title: 'Metode Pembayaran Kasir',
			description:
				'Konfigurasi kas kecil tunai (cash drawer), rekening transfer bank (BCA, Mandiri), dan QRIS dinamis di meja kasir.',
			href: '#',
			badge: '3 Rekening',
			icon: IconCreditCard
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Pusat Pengaturan & Master Data
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Kelola seluruh master data operasional percetakan, parameter mesin, katalog bahan baku, dan
			konfigurasi sistem terpusat.
		</Typography>
	</div>

	<!-- Master Data Modules Grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each masterDataModules as item (item.title)}
			{@const ItemIcon = item.icon}
			<Card
				class="flex flex-col justify-between bg-app-surface shadow-xs transition-shadow duration-150 hover:shadow-sm"
			>
				<CardHeader class="flex flex-row items-start justify-between gap-4">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<ItemIcon class="size-5" />
					</div>
					<Badge variant="secondary" size="sm">{item.badge}</Badge>
				</CardHeader>
				<CardContent class="flex flex-1 flex-col justify-between gap-4 pt-0">
					<div>
						<CardTitle class="text-sm font-semibold text-foreground">
							{item.title}
						</CardTitle>
						<p class="mt-1.5 text-xs leading-relaxed text-foreground-subtle">
							{item.description}
						</p>
					</div>

					<div class="border-t border-border pt-3">
						<Button
							variant="ghost"
							size="sm"
							class="w-full justify-between px-0 text-primary hover:text-primary"
						>
							{#snippet child({ props })}
								<a
									{...props}
									href={item.href}
									class="flex w-full items-center justify-between text-xs font-medium text-primary"
								>
									<span>Buka Pengaturan</span>
									<IconArrowRight class="size-3.5" />
								</a>
							{/snippet}
						</Button>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>
