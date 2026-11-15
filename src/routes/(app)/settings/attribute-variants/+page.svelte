<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import AttributeVariantListPage from '$features/attribute-variants/presentation/pages/AttributeVariantListPage.svelte';

	pageTitleStore.set('Atribut & Varian Produk');
</script>

<AttributeVariantListPage />
