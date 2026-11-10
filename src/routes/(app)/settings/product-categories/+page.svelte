<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import ProductCategoryListPage from '$features/product-categories/presentation/pages/ProductCategoryListPage.svelte';

	pageTitleStore.set('Kategori Produk');
</script>

<ProductCategoryListPage />
