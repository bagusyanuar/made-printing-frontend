<script lang="ts">
	import { resolve } from '$app/paths';
	import IconShieldX from '~icons/lucide/shield-x';
	import StatusPageLayout from './StatusPageLayout.svelte';

	interface Props {
		/** Judul status 403 */
		title?: string;
		/** Deskripsi atau penjelasan */
		description?: string;
		/** Nama role yang dibutuhkan (opsional) */
		requiredRole?: string;
		/** URL tombol utama */
		dashboardHref?: string;
	}

	let {
		title = 'Akses Ditolak / Dibatasi',
		description,
		requiredRole,
		dashboardHref = resolve('/(app)/dashboard')
	}: Props = $props();

	const defaultDescription = $derived(
		description ??
			(requiredRole
				? `Halaman ini memerlukan hak akses peran khusus (${requiredRole}). Akun Anda belum memiliki otorisasi untuk membuka fitur ini.`
				: 'Akun Anda tidak memiliki hak izin akses untuk membuka modul ini. Silakan hubungi Administrator sistem Made Printing untuk bantuan penyesuaian hak akses.')
	);
</script>

<StatusPageLayout
	badgeText="Error 403 · Akses Dibatasi"
	badgeClass="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
	icon={IconShieldX}
	iconWrapperClass="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
	{title}
	description={defaultDescription}
	primaryAction={{
		label: 'Kembali ke Dashboard',
		href: dashboardHref
	}}
	secondaryAction={{
		label: 'Pengaturan Akses',
		href: resolve('/(app)/settings/access')
	}}
/>

