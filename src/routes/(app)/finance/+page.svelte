<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { NavigationCard } from '$lib/components/navigation-card';
	import IconLandmark from '~icons/lucide/landmark';
	import IconHandCoins from '~icons/lucide/hand-coins';
	import IconArrowLeftRight from '~icons/lucide/arrow-left-right';
	import IconUsers from '~icons/lucide/users';

	pageTitleStore.set('Keuangan');

	const financeModules = [
		{
			title: 'Setoran Modal',
			description:
				'Pencatatan penambahan modal usaha, injeksi likuiditas kas, dan investasi aktiva lancar percetakan.',
			href: resolve('/(app)/finance/capital-deposit'),
			icon: IconLandmark
		},
		{
			title: 'Penarikan Modal (Prive)',
			description:
				'Kelola riwayat pengambilan bagian keuntungan (dividen) atau penarikan ekuitas pemilik dari kas bisnis.',
			href: resolve('/(app)/finance/withdrawals'),
			icon: IconHandCoins
		},
		{
			title: 'Pemindahan Dana',
			description:
				'Catat transfer antar rekening bank perusahaan, setoran tunai kasir harian, dan top-up kas kecil.',
			href: resolve('/(app)/finance/transfers'),
			icon: IconArrowLeftRight
		}
	];

	const internalReceivableModules = [
		{
			title: 'Kasbon Pegawai',
			description:
				'Pencatatan pinjaman kasbon karyawan, pemantauan sisa piutang berjalan, serta pelunasan melalui cicilan kas atau potong gaji.',
			href: '#kasbon-pegawai',
			icon: IconUsers,
			badge: 'Segera Hadir',
			disabled: true
		}
	];
</script>

<div class="flex flex-col gap-8">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
		>
			<IconLandmark class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-semibold tracking-tight text-foreground">
				Pusat Keuangan & Mutasi Kas
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola permodalan usaha, penarikan laba (prive), mutasi pemindahan dana, serta piutang
				kasbon karyawan Made Printing.
			</Typography>
		</div>
	</div>

	<!-- Capital & Cash Flow Section -->
	<div class="flex flex-col gap-4">
		<div class="border-b border-border pb-2">
			<Typography variant="h3" as="h2" class="font-semibold text-foreground">
				Manajemen Modal & Kas
			</Typography>
			<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
				Pencatatan transaksi non-penjualan untuk menjaga akurasi saldo kas, bank, dan ekuitas
				perusahaan.
			</Typography>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each financeModules as item (item.title)}
				<NavigationCard {...item} />
			{/each}
		</div>
	</div>

	<!-- Internal Receivables Section -->
	<div class="flex flex-col gap-4">
		<div class="border-b border-border pb-2">
			<Typography variant="h3" as="h2" class="font-semibold text-foreground">
				Piutang Internal & Karyawan
			</Typography>
			<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
				Pengelolaan kasbon pegawai dan riwayat pembayarannya tanpa mencampuri laporan laba rugi
				operasional.
			</Typography>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each internalReceivableModules as item (item.title)}
				<NavigationCard {...item} />
			{/each}
		</div>
	</div>
</div>
