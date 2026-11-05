import IconLayoutDashboard from '~icons/lucide/layout-dashboard';
import IconTicket from '~icons/lucide/ticket';
import IconCirclePlus from '~icons/lucide/circle-plus';
import IconFileCheck from '~icons/lucide/file-check';
import IconReceipt from '~icons/lucide/receipt';
import IconLandmark from '~icons/lucide/landmark';
import IconHandCoins from '~icons/lucide/hand-coins';
import IconArrowLeftRight from '~icons/lucide/arrow-left-right';
import IconTag from '~icons/lucide/tag';
import IconHandshake from '~icons/lucide/handshake';
import IconTrendingUp from '~icons/lucide/trending-up';
import IconTrendingDown from '~icons/lucide/trending-down';
import IconBanknote from '~icons/lucide/banknote';
import IconScale from '~icons/lucide/scale';
import IconSettings from '~icons/lucide/settings';
import IconShieldCheck from '~icons/lucide/shield-check';

import type { NavSection } from '$lib/components/ui/sidebar/sidebar.types';

export const appNavSections: NavSection[] = [
	{
		label: '',
		entries: [
			{
				title: 'Dashboard',
				href: '/dashboard',
				icon: IconLayoutDashboard
			},
			{
				title: 'Produk',
				href: '/products',
				icon: IconTag
			},
			{
				title: 'Biro/Reseller',
				href: '/resellers',
				icon: IconHandshake
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
				icon: IconCirclePlus
			},
			{
				title: 'Invoice',
				href: '/transactions/invoices',
				icon: IconFileCheck
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
				icon: IconTrendingUp
			},
			{
				title: 'Laporan Pengeluaran',
				href: '/reports/expenses',
				icon: IconTrendingDown
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
			},
			{
				title: 'Hak Akses',
				href: '/settings/access',
				icon: IconShieldCheck
			}
		]
	}
];
