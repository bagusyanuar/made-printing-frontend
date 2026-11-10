<script lang="ts">
	import { resolve } from '$app/paths';
	import IconConstruction from '~icons/lucide/construction';
	import StatusPageLayout from './StatusPageLayout.svelte';

	interface Props {
		/** Nama fitur atau modul yang sedang dibuat (contoh: "Katalog Bahan Baku") */
		featureName?: string;
		/** Kategori induk modul (contoh: "Master Data Percetakan") */
		category?: string;
		/** Deskripsi estimasi fitur yang akan datang */
		description?: string;
		/** Rute URL saat tombol kembali ditekan */
		backHref?: string;
	}

	let {
		featureName = 'Fitur Sedang Disiapkan',
		category,
		description,
		backHref = resolve('/(app)/settings')
	}: Props = $props();

	const defaultDescription = $derived(
		description ??
			`Modul ${featureName} saat ini masih dalam tahap perancangan dan pengembangan aktif oleh tim Made Printing. Fitur ini akan segera tersedia untuk operasional Anda.`
	);
</script>

<StatusPageLayout
	badgeText={category ? `Dalam Pengembangan · ${category}` : 'Dalam Pengembangan'}
	badgeClass="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
	icon={IconConstruction}
	iconWrapperClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
	title={featureName}
	description={defaultDescription}
	primaryAction={{
		label: 'Kembali ke Pengaturan',
		href: backHref
	}}
/>

