<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import IconArrowLeftRight from '~icons/lucide/arrow-left-right';
	import IconBanknote from '~icons/lucide/banknote';
	import IconChartLine from '~icons/lucide/chart-line';
	import IconChartPie from '~icons/lucide/chart-pie';
	import IconFolderTree from '~icons/lucide/folder-tree';
	import IconHandCoins from '~icons/lucide/hand-coins';
	import IconHandshake from '~icons/lucide/handshake';
	import IconLandmark from '~icons/lucide/landmark';
	import IconPlus from '~icons/lucide/plus';
	import IconReceipt from '~icons/lucide/receipt';
	import IconScale from '~icons/lucide/scale';
	import IconShieldCheck from '~icons/lucide/shield-check';
	import IconSlidersHorizontal from '~icons/lucide/sliders-horizontal';
	import IconTag from '~icons/lucide/tag';
	import IconTruck from '~icons/lucide/truck';
	import { AppLayout } from '$lib/components/layout/app-layout';
	import type { CommandPaletteItem } from '$lib/components/layout/command-palette';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { themeStore } from '$lib/shared/presentation/theme.store.svelte';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { appNavSections } from './app.nav';

	let { children } = $props();

	let collapsed = $state(false);

	const brand = {
		initial: 'MP',
		name: 'Made Printing',
		subtitle: 'Digital Printing ERP'
	};

	const currentUser = {
		initials: 'AD',
		name: 'Admin Percetakan',
		subtitle: 'admin@madeprinting.com'
	};

	const extraCommands: CommandPaletteItem[] = [
		{
			id: 'quick:new-ticket',
			title: 'Buat Tiket Pesanan Baru',
			group: 'TRANSAKSI',
			subtitle: 'SPK / Order Masuk',
			keywords: ['tiket', 'order', 'spk', 'buat', 'baru'],
			icon: IconPlus,
			href: resolve('/(app)/tickets/new'),
			onSelect: () => goto(resolve('/(app)/tickets/new'))
		},
		{
			id: 'finance:capital-deposit',
			title: 'Setoran Modal',
			group: 'KEUANGAN',
			keywords: ['setoran', 'modal', 'kas', 'keuangan'],
			icon: IconLandmark,
			href: resolve('/(app)/finance/capital-deposit'),
			onSelect: () => goto(resolve('/(app)/finance/capital-deposit'))
		},
		{
			id: 'finance:withdrawals',
			title: 'Penarikan Modal (Prive)',
			group: 'KEUANGAN',
			keywords: ['prive', 'penarikan', 'modal', 'keuangan'],
			icon: IconHandCoins,
			href: resolve('/(app)/finance/withdrawals'),
			onSelect: () => goto(resolve('/(app)/finance/withdrawals'))
		},
		{
			id: 'finance:transfers',
			title: 'Pemindahan Dana',
			group: 'KEUANGAN',
			keywords: ['transfer', 'pemindahan', 'dana', 'mutasi', 'rekening'],
			icon: IconArrowLeftRight,
			href: resolve('/(app)/finance/transfers'),
			onSelect: () => goto(resolve('/(app)/finance/transfers'))
		},
		{
			id: 'reports:sales',
			title: 'Laporan Penjualan',
			group: 'LAPORAN',
			keywords: ['laporan', 'penjualan', 'omzet', 'sales'],
			icon: IconChartPie,
			href: resolve('/(app)/reports/sales'),
			onSelect: () => goto(resolve('/(app)/reports/sales'))
		},
		{
			id: 'reports:expenses',
			title: 'Laporan Pengeluaran',
			group: 'LAPORAN',
			keywords: ['laporan', 'pengeluaran', 'biaya', 'expenses'],
			icon: IconChartLine,
			href: resolve('/(app)/reports/expenses'),
			onSelect: () => goto(resolve('/(app)/reports/expenses'))
		},
		{
			id: 'reports:cash-flow',
			title: 'Laporan Arus Kas',
			group: 'LAPORAN',
			keywords: ['laporan', 'arus kas', 'cash flow', 'kas'],
			icon: IconBanknote,
			href: resolve('/(app)/reports/cash-flow'),
			onSelect: () => goto(resolve('/(app)/reports/cash-flow'))
		},
		{
			id: 'reports:profit-loss',
			title: 'Laporan Laba Rugi',
			group: 'LAPORAN',
			keywords: ['laporan', 'laba rugi', 'profit', 'loss'],
			icon: IconScale,
			href: resolve('/(app)/reports/profit-loss'),
			onSelect: () => goto(resolve('/(app)/reports/profit-loss'))
		},
		{
			id: 'master:product-categories',
			title: 'Kategori Produk',
			group: 'MASTER DATA',
			keywords: ['kategori', 'produk', 'satuan'],
			icon: IconFolderTree,
			href: resolve('/(app)/settings/product-categories'),
			onSelect: () => goto(resolve('/(app)/settings/product-categories'))
		},
		{
			id: 'master:attribute-variants',
			title: 'Atribut & Varian Produk',
			group: 'MASTER DATA',
			keywords: ['atribut', 'varian', 'eav', 'spesifikasi'],
			icon: IconSlidersHorizontal,
			href: resolve('/(app)/settings/attribute-variants'),
			onSelect: () => goto(resolve('/(app)/settings/attribute-variants'))
		},
		{
			id: 'master:products',
			title: 'Katalog Produk Cetak',
			group: 'MASTER DATA',
			keywords: ['katalog', 'produk', 'harga'],
			icon: IconTag,
			href: resolve('/(app)/settings/products'),
			onSelect: () => goto(resolve('/(app)/settings/products'))
		},
		{
			id: 'master:resellers',
			title: 'Biro & Reseller',
			group: 'MASTER DATA',
			keywords: ['biro', 'reseller', 'mitra', 'piutang'],
			icon: IconHandshake,
			href: resolve('/(app)/settings/resellers'),
			onSelect: () => goto(resolve('/(app)/settings/resellers'))
		},
		{
			id: 'master:suppliers',
			title: 'Supplier & Pemasok',
			group: 'MASTER DATA',
			keywords: ['supplier', 'pemasok', 'vendor', 'bahan'],
			icon: IconTruck,
			href: resolve('/(app)/settings/suppliers'),
			onSelect: () => goto(resolve('/(app)/settings/suppliers'))
		},
		{
			id: 'master:expense-categories',
			title: 'Kategori Pengeluaran',
			group: 'MASTER DATA',
			keywords: ['kategori', 'pengeluaran', 'biaya'],
			icon: IconReceipt,
			href: resolve('/(app)/settings/expense-categories'),
			onSelect: () => goto(resolve('/(app)/settings/expense-categories'))
		},
		{
			id: 'settings:access',
			title: 'Hak Akses & Pengguna',
			group: 'PENGATURAN',
			keywords: ['hak akses', 'role', 'pengguna', 'user'],
			icon: IconShieldCheck,
			href: resolve('/(app)/settings/access'),
			onSelect: () => goto(resolve('/(app)/settings/access'))
		}
	];
</script>

<AppLayout
	bind:collapsed
	activeHref={page.url.pathname}
	sections={appNavSections}
	{extraCommands}
	{brand}
	version="1.0.0"
	user={currentUser}
	isDark={themeStore.isDark}
	onToggleTheme={() => themeStore.toggle()}
	onNavigate={(href) => goto(href)}
	onLogout={() => console.log('Logout clicked')}
>
	{#snippet title()}
		{#if pageTitleStore.title}
			<Typography variant="h4" as="h1" class="text-sm font-semibold text-foreground">
				{pageTitleStore.title}
			</Typography>
		{/if}
	{/snippet}

	{@render children()}
</AppLayout>
