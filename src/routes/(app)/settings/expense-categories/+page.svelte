<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { UnderConstructionPage } from '$lib/components/status-pages';

	pageTitleStore.set('Kategori Pengeluaran');
</script>

<UnderConstructionPage
	featureName="Kategori Pengeluaran"
	category="Master Data Keuangan"
	description="Kelola pos dan klasifikasi biaya operasional percetakan seperti pembelian bahan baku, utilitas listrik & workshop, pemeliharaan mesin cetak, serta biaya operasional lainnya."
	backHref={resolve('/(app)/settings')}
/>

