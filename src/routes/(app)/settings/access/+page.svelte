<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconShieldCheck from '~icons/lucide/shield-check';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconUsers from '~icons/lucide/users';
	import IconLock from '~icons/lucide/lock';
	import IconKeyRound from '~icons/lucide/key-round';

	pageTitleStore.set('Hak Akses & Pengguna');

	const stats = [
		{
			title: 'Total Akun Pengguna',
			value: '12 Karyawan',
			subtitle: 'Semua shift aktif',
			icon: IconUsers
		},
		{
			title: 'Peran / Role Terdaftar',
			value: '5 Peran',
			subtitle: 'Owner, Kasir, Operator, Finance',
			icon: IconShieldCheck
		},
		{
			title: 'Akses Khusus Keuangan',
			value: '3 Akun',
			subtitle: 'Owner & Keuangan Utama',
			icon: IconLock
		},
		{
			title: 'Status Autentikasi',
			value: 'Aktif (2FA)',
			subtitle: 'Keamanan sesi berbasis token',
			icon: IconKeyRound
		}
	];

	const rolesMatrix = [
		{
			role: 'Owner / Superadmin',
			usersCount: 2,
			description:
				'Akses penuh ke seluruh modul ERP: Keuangan, Laporan Laba Rugi, Pengaturan Sistem, dan Hak Akses.',
			badgeVariant: 'danger' as const
		},
		{
			role: 'Kasir & Front Desk POS',
			usersCount: 3,
			description:
				'Dapat membuat pesanan baru, input nota kasir, cetak struk pembayaran DP/Lunas, dan mendaftarkan biro reseller.',
			badgeVariant: 'secondary' as const
		},
		{
			role: 'Operator Mesin Cetak (Pre-press)',
			usersCount: 4,
			description:
				'Mengelola tiket antrean mesin cetak, cek file desain & nesting, update status printing. Tidak dapat melihat harga modal.',
			badgeVariant: 'info' as const
		},
		{
			role: 'Operator Finishing & QC',
			usersCount: 2,
			description:
				'Mengupdate status mata ayam, seaming banner, potong/laminasi A3+, dan verifikasi barang siap diambil.',
			badgeVariant: 'secondary' as const
		},
		{
			role: 'Finance & Penagihan',
			usersCount: 1,
			description:
				'Pencatatan pengeluaran operasional, verifikasi invoice piutang reseller, rekapitulasi arus kas harian.',
			badgeVariant: 'warning' as const
		}
	];

	const sampleUsers = [
		{
			name: 'Bagus Yanuar',
			email: 'bagus.yanuar613@gmail.com',
			role: 'Owner / Superadmin',
			status: 'Aktif',
			lastActive: 'Baru saja'
		},
		{
			name: 'Siti Rahmawati',
			email: 'siti.kasir@madeprinting.com',
			role: 'Kasir & Front Desk POS',
			status: 'Aktif',
			lastActive: '5 menit lalu'
		},
		{
			name: 'Dimas Prasetyo',
			email: 'dimas.mesin@madeprinting.com',
			role: 'Operator Mesin Cetak',
			status: 'Aktif',
			lastActive: '20 menit lalu'
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Hak Akses & Manajemen Peran (RBAC)
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Kelola kewenangan staf kasir, operator bengkel produksi, finance, serta proteksi keamanan
				modul sensitif.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Tambah Pengguna Baru
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

	<!-- Roles Overview Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Peran & Ruang Lingkup Wewenang
			</CardTitle>
		</CardHeader>
		<CardContent class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{#each rolesMatrix as r (r.role)}
				<div class="rounded-lg border border-border bg-canvas p-4">
					<div class="flex items-center justify-between">
						<Badge variant={r.badgeVariant} size="sm">{r.role}</Badge>
						<span class="text-[11px] font-medium text-foreground-subtle"
							>{r.usersCount} Pengguna</span
						>
					</div>
					<p class="mt-2.5 text-xs leading-relaxed text-foreground-subtle">
						{r.description}
					</p>
				</div>
			{/each}
		</CardContent>
	</Card>

	<!-- Team Users Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Akun Pengguna Tim Percetakan
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari nama karyawan / email..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">Nama Karyawan</th>
							<th class="px-4 py-2.5 font-medium">Email Akun</th>
							<th class="px-4 py-2.5 font-medium">Peran (Role)</th>
							<th class="px-4 py-2.5 font-medium">Status Akun</th>
							<th class="px-4 py-2.5 font-medium">Aktivitas Terakhir</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleUsers as u (u.email)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-foreground">{u.name}</td>
								<td class="px-4 py-3 font-mono text-foreground-subtle">{u.email}</td>
								<td class="px-4 py-3">
									<Badge variant="secondary" size="sm">{u.role}</Badge>
								</td>
								<td class="px-4 py-3">
									<Badge variant="success" size="sm">{u.status}</Badge>
								</td>
								<td class="px-4 py-3 text-foreground-subtle">{u.lastActive}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
