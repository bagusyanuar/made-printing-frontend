import IconLayoutDashboard from '~icons/lucide/layout-dashboard';
import IconReceipt from '~icons/lucide/receipt';
import IconFileText from '~icons/lucide/file-text';
import IconPrinter from '~icons/lucide/printer';
import IconLayers from '~icons/lucide/layers';
import IconScissors from '~icons/lucide/scissors';
import IconBoxes from '~icons/lucide/boxes';
import IconPackage from '~icons/lucide/package';
import IconDroplets from '~icons/lucide/droplets';
import IconDatabase from '~icons/lucide/database';
import IconUsers from '~icons/lucide/users';
import IconWrench from '~icons/lucide/wrench';
import IconSparkles from '~icons/lucide/sparkles';
import IconBarChart3 from '~icons/lucide/bar-chart-3';

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
				title: 'Kasir & POS',
				href: '/pos',
				icon: IconReceipt,
				badge: 'Kasir'
			},
			{
				title: 'Order & SPK',
				href: '/orders',
				icon: IconFileText
			}
		]
	},
	{
		label: 'PRODUKSI & WORKFLOW',
		entries: [
			{
				id: 'production-workflow',
				title: 'Produksi',
				icon: IconPrinter,
				children: [
					{
						title: 'Antrean Mesin Cetak',
						href: '/production/queues',
						icon: IconPrinter
					},
					{
						title: 'Pra-Cetak & Nesting',
						href: '/production/prepress',
						icon: IconLayers
					},
					{
						title: 'Finishing & QC',
						href: '/production/finishing',
						icon: IconScissors
					}
				]
			},
			{
				id: 'inventory-management',
				title: 'Inventaris',
				icon: IconBoxes,
				children: [
					{
						title: 'Bahan Roll & Lembaran',
						href: '/inventory/materials',
						icon: IconPackage
					},
					{
						title: 'Tinta & Consumables',
						href: '/inventory/consumables',
						icon: IconDroplets
					}
				]
			}
		]
	},
	{
		label: 'PENGATURAN & MASTER DATA',
		entries: [
			{
				id: 'master-data',
				title: 'Master Data',
				icon: IconDatabase,
				children: [
					{
						title: 'Katalog Bahan Baku',
						href: '/master/materials',
						icon: IconPackage
					},
					{
						title: 'Mesin Percetakan',
						href: '/master/machines',
						icon: IconWrench
					},
					{
						title: 'Layanan Finishing',
						href: '/master/finishings',
						icon: IconSparkles
					},
					{
						title: 'Pelanggan & Reseller',
						href: '/master/customers',
						icon: IconUsers
					}
				]
			},
			{
				title: 'Laporan Keuangan',
				href: '/finance',
				icon: IconBarChart3
			}
		]
	}
];

