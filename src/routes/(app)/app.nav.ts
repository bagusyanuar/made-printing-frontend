import IconLayoutDashboard from '~icons/lucide/layout-dashboard';
import IconTicket from '~icons/lucide/ticket';
import IconShoppingBag from '~icons/lucide/shopping-bag';
import IconReceipt from '~icons/lucide/receipt';
import IconLandmark from '~icons/lucide/landmark';
import IconHandCoins from '~icons/lucide/hand-coins';
import IconArrowLeftRight from '~icons/lucide/arrow-left-right';
import IconChartPie from '~icons/lucide/chart-pie';
import IconChartLine from '~icons/lucide/chart-line';
import IconBanknote from '~icons/lucide/banknote';
import IconScale from '~icons/lucide/scale';
import IconSettings from '~icons/lucide/settings';

import type { NavSection } from '$lib/components/ui/sidebar/sidebar.types';

export const appNavSections: NavSection[] = [
	{
		label: '',
		entries: [
			{
				title: 'Dashboard',
				href: '/dashboard',
				icon: IconLayoutDashboard
			}
		]
	},
	{
		label: 'TRANSAKSI',
		entries: [
			{
				title: 'Tiket Pesanan',
				href: '/transactions/tickets',
				icon: IconTicket
			},
			{
				title: 'Pesanan Baru',
				href: '/transactions/new',
				icon: IconShoppingBag
			},
			{
				title: 'Invoice',
				href: '/transactions/invoices',
				icon: IconReceipt
			}
		]
	},
	{
		label: 'KEUANGAN',
		entries: [
			{
				title: 'Pengeluaran',
				href: '/finance/expenses',
				icon: IconReceipt
			},
			{
				title: 'Setoran Modal',
				href: '/finance/capital-deposit',
				icon: IconLandmark
			},
			{
				title: 'Penarikan Modal (Prive)',
				href: '/finance/withdrawals',
				icon: IconHandCoins
			},
			{
				title: 'Pemindahan Dana',
				href: '/finance/transfers',
				icon: IconArrowLeftRight
			}
		]
	},
	{
		label: 'LAPORAN',
		entries: [
			{
				title: 'Laporan Penjualan',
				href: '/reports/sales',
				icon: IconChartPie
			},
			{
				title: 'Laporan Pengeluaran',
				href: '/reports/expenses',
				icon: IconChartLine
			},
			{
				title: 'Laporan Arus Kas',
				href: '/reports/cash-flow',
				icon: IconBanknote
			},
			{
				title: 'Laporan Laba Rugi',
				href: '/reports/profit-loss',
				icon: IconScale
			}
		]
	},
	{
		label: 'PENGATURAN',
		entries: [
			{
				title: 'Pengaturan',
				href: '/settings',
				icon: IconSettings
			}
		]
	}
];
