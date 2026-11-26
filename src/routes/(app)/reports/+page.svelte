<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { NavigationCard } from '$lib/components/navigation-card';
	import IconChartPie from '~icons/lucide/chart-pie';
	import IconChartLine from '~icons/lucide/chart-line';
	import IconBanknote from '~icons/lucide/banknote';
	import IconScale from '~icons/lucide/scale';
	import IconHandCoins from '~icons/lucide/hand-coins';
	import IconCreditCard from '~icons/lucide/credit-card';

	pageTitleStore.set('Laporan');

	const operationalReportModules = [
		{
			title: 'Laporan Penjualan',
			description:
				'Rekap omzet penjualan, volume SPK, nilai rata-rata order (AOV), rincian kategori cetak, dan sisa piutang berjalan.',
			href: resolve('/(app)/reports/sales'),
			icon: IconChartPie
		},
		{
			title: 'Laporan Pengeluaran',
			description:
				'Analisis beban pokok penjualan (HPP bahan & tinta), biaya operasional workshop (OPEX), dan rasio beban terhadap omzet.',
			href: resolve('/(app)/reports/expenses'),
			icon: IconChartLine
		}
	];

	const financialReportModules = [
		{
			title: 'Laporan Arus Kas',
			description:
				'Pantau pergerakan kas masuk dan keluar dari aktivitas operasional, modal, prive, serta saldo kas dan rekening bank.',
			href: resolve('/(app)/reports/cash-flow'),
			icon: IconBanknote
		},
		{
			title: 'Laporan Laba Rugi',
			description:
				'Evaluasi pendapatan bersih, laba kotor (gross profit), total beban operasional, hingga laba bersih usaha (net profit).',
			href: resolve('/(app)/reports/profit-loss'),
			icon: IconScale
		}
	];

	const debtReportModules = [
		{
			title: 'Laporan Piutang',
			description:
				'Pantau umur piutang (aging) pesanan customer, limit kredit tempo reseller, serta sisa kasbon pegawai yang belum lunas.',
			href: '#laporan-piutang',
			icon: IconHandCoins,
			badge: 'Segera Hadir',
			disabled: true
		},
		{
			title: 'Laporan Hutang',
			description:
				'Rekap kewajiban nota pengeluaran dan pembelian bahan baku ke supplier yang masih berstatus belum lunas atau cicilan.',
			href: '#laporan-hutang',
			icon: IconCreditCard,
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
			<IconChartPie class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-semibold tracking-tight text-foreground">
				Pusat Laporan & Analitik Bisnis
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Pantau performa penjualan cetak, struktur biaya workshop, arus kas, profitabilitas, serta
				posisi hutang dan piutang Made Printing.
			</Typography>
		</div>
	</div>

	<!-- Operational Reports Section -->
	<div class="flex flex-col gap-4">
		<div class="border-b border-border pb-2">
			<Typography variant="h3" as="h2" class="font-semibold text-foreground">
				Laporan Operasional
			</Typography>
			<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
				Ringkasan omzet penjualan harian, transaksi SPK, serta rincian beban HPP dan operasional.
			</Typography>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each operationalReportModules as item (item.title)}
				<NavigationCard {...item} />
			{/each}
		</div>
	</div>

	<!-- Financial Reports Section -->
	<div class="flex flex-col gap-4">
		<div class="border-b border-border pb-2">
			<Typography variant="h3" as="h2" class="font-semibold text-foreground">
				Laporan Keuangan & Profitabilitas
			</Typography>
			<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
				Rekapitulasi likuiditas kas, pergerakan dana, dan laporan laba rugi komprehensif perusahaan.
			</Typography>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each financialReportModules as item (item.title)}
				<NavigationCard {...item} />
			{/each}
		</div>
	</div>

	<!-- Receivables & Payables Reports Section -->
	<div class="flex flex-col gap-4">
		<div class="border-b border-border pb-2">
			<Typography variant="h3" as="h2" class="font-semibold text-foreground">
				Laporan Hutang & Piutang
			</Typography>
			<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
				Monitoring tagihan piutang pelanggan, kasbon internal, dan kewajiban pembayaran ke supplier.
			</Typography>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each debtReportModules as item (item.title)}
				<NavigationCard {...item} />
			{/each}
		</div>
	</div>
</div>
