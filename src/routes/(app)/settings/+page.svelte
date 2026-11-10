<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { NavigationCard } from '$lib/components/navigation-card';
	import IconSettings from '~icons/lucide/settings';
	import IconFolderTree from '~icons/lucide/folder-tree';
	import IconSlidersHorizontal from '~icons/lucide/sliders-horizontal';
	import IconTag from '~icons/lucide/tag';
	import IconHandshake from '~icons/lucide/handshake';
	import IconTruck from '~icons/lucide/truck';
	import IconReceipt from '~icons/lucide/receipt';
	import IconShieldCheck from '~icons/lucide/shield-check';

	pageTitleStore.set('Pengaturan Sistem');

	const masterDataModules = [
		{
			title: 'Kategori Produk',
			description:
				'Kelola kelompok produk cetak (Large Format, Lembaran A3+, DTF, Merchandise) dan model satuan hitung (m², lembar, meter lari, pcs).',
			href: resolve('/(app)/settings/product-categories'),
			icon: IconFolderTree
		},
		{
			title: 'Atribut & Varian Produk',
			description:
				'Kelola skema varian dan atribut spesifikasi (EAV) seperti sisi cetak (1 sisi / 2 sisi), gramatur bahan (280g, 340g), varian laminasi, dll.',
			href: resolve('/(app)/settings/attribute-variants'),
			icon: IconSlidersHorizontal
		},
		{
			title: 'Katalog Produk Cetak',
			description:
				'Daftar produk cetak jadi, spesifikasi bahan baku, skema perhitungan harga (retail/reseller), dan status aktif produk.',
			href: resolve('/(app)/settings/products'),
			icon: IconTag
		},
		{
			title: 'Biro & Reseller',
			description:
				'Manajemen kemitraan percetakan, penetapan tier harga reseller, plafon limit kredit piutang (TOP), dan saldo deposit mitra.',
			href: resolve('/(app)/settings/resellers'),
			icon: IconHandshake
		},
		{
			title: 'Supplier & Pemasok',
			description:
				'Kelola data vendor pemasok bahan baku (kertas roll/sheet, banner), tinta cetak, suku cadang mesin, dan perlengkapan percetakan.',
			href: resolve('/(app)/settings/suppliers'),
			icon: IconTruck
		},
		{
			title: 'Kategori Pengeluaran',
			description:
				'Klasifikasi pos biaya operasional percetakan (pembelian bahan, utilitas workshop, perawatan mesin, logistik, dll).',
			href: resolve('/(app)/settings/expense-categories'),
			icon: IconReceipt
		}
	];

	const systemSettingsModules = [
		{
			title: 'Hak Akses & Pengguna',
			description:
				'Atur hak izin per peran (Admin, Kasir, CS, Operator Mesin, Finishing, Desainer RIP).',
			href: resolve('/(app)/settings/access'),
			icon: IconShieldCheck
		}
	];
</script>

<div class="flex flex-col gap-8">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconSettings class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Pusat Pengaturan & Master Data
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola konfigurasi sistem, hak akses, dan master data operasional percetakan Made Printing.
			</Typography>
		</div>
	</div>

	<!-- Master Data Section -->
	<div class="flex flex-col gap-4">
		<div class="border-b border-border pb-2">
			<Typography variant="h3" as="h2" class="font-semibold text-foreground">
				Master Data Operasional
			</Typography>
			<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
				Basis data utama untuk identifikasi produk, kalkulasi biaya cetak, dan alur kerja SPK.
			</Typography>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each masterDataModules as item (item.title)}
				<NavigationCard {...item} />
			{/each}
		</div>
	</div>

	<!-- System Settings Section -->
	<div class="flex flex-col gap-4">
		<div class="border-b border-border pb-2">
			<Typography variant="h3" as="h2" class="font-semibold text-foreground">
				Konfigurasi Sistem
			</Typography>
			<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
				Manajemen hak akses pengguna dan aturan keamanan aplikasi.
			</Typography>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each systemSettingsModules as item (item.title)}
				<NavigationCard {...item} />
			{/each}
		</div>
	</div>
</div>
