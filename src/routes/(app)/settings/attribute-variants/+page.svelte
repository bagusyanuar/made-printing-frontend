<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { UnderConstructionPage } from '$lib/components/status-pages';

	pageTitleStore.set('Atribut & Varian Produk');
</script>

<UnderConstructionPage
	featureName="Atribut & Varian Produk (EAV)"
	category="Master Data Percetakan"
	description="Kelola spesifikasi dinamis produk cetak: sisi cetak (1 sisi / 2 sisi), gramatur material (280g, 340g, 440g), pilihan laminasi (doff/glossy), dan opsi kustom lainnya."
	backHref={resolve('/(app)/settings')}
/>

