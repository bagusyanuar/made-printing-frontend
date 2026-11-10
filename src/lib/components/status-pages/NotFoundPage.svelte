<script lang="ts">
	import { resolve } from '$app/paths';
	import IconSearchX from '~icons/lucide/search-x';
	import StatusPageLayout from './StatusPageLayout.svelte';

	interface Props {
		/** Judul status 404 */
		title?: string;
		/** Deskripsi atau penjelasan */
		description?: string;
		/** URL tombol utama */
		dashboardHref?: string;
	}

	let {
		title = 'Halaman Tidak Ditemukan',
		description = 'Halaman atau alamat URL yang Anda tuju tidak tersedia, telah dipindahkan, atau terjadi kesalahan pengetikan tautan.',
		dashboardHref = resolve('/(app)/dashboard')
	}: Props = $props();
</script>

<StatusPageLayout
	badgeText="Error 404 · Halaman Tidak Ditemukan"
	badgeClass="bg-primary/10 text-primary border-primary/20"
	icon={IconSearchX}
	iconWrapperClass="bg-primary/10 text-primary border-primary/20"
	{title}
	{description}
	primaryAction={{
		label: 'Kembali ke Dashboard',
		href: dashboardHref
	}}
/>

