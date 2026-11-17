<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import SupplierListPage from '$features/suppliers/presentation/pages/SupplierListPage.svelte';

	pageTitleStore.set('Supplier & Pemasok');
</script>

<SupplierListPage />
