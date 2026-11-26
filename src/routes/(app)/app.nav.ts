import IconLayoutDashboard from '~icons/lucide/layout-dashboard';
import IconTicket from '~icons/lucide/ticket';
import IconShoppingBag from '~icons/lucide/shopping-bag';
import IconReceipt from '~icons/lucide/receipt';
import IconWallet from '~icons/lucide/wallet';
import IconLandmark from '~icons/lucide/landmark';
import IconChartPie from '~icons/lucide/chart-pie';
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
				title: 'Tiket',
				href: '/tickets',
				icon: IconTicket,
				keywords: ['tiket pesanan', 'spk', 'order']
			},
			{
				title: 'Kasir',
				href: '/cashier',
				icon: IconShoppingBag
			},
			{
				title: 'Pesanan',
				href: '/orders',
				icon: IconReceipt
			},
			{
				title: 'Pengeluaran',
				href: '/expenses',
				icon: IconWallet
			}
		]
	},
	{
		label: 'MANAJEMEN',
		entries: [
			{
				title: 'Keuangan',
				href: '/finance',
				icon: IconLandmark,
				keywords: ['setoran modal', 'prive', 'penarikan modal', 'pemindahan dana', 'kas', 'kasbon']
			},
			{
				title: 'Laporan',
				href: '/reports',
				icon: IconChartPie,
				keywords: [
					'penjualan',
					'pengeluaran',
					'arus kas',
					'laba rugi',
					'rekap',
					'hutang',
					'piutang'
				]
			},
			{
				title: 'Pengaturan',
				href: '/settings',
				icon: IconSettings,
				keywords: ['master data', 'produk', 'reseller', 'supplier', 'hak akses']
			}
		]
	}
];
