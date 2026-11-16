<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import ProductListPage from '$features/products/presentation/pages/ProductListPage.svelte';

	pageTitleStore.set('Katalog & Produk Cetak');
</script>

<ProductListPage />
