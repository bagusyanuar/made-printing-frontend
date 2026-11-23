<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import OrderListPage from '$features/orders/presentation/pages/OrderListPage.svelte';

	pageTitleStore.set('Pesanan');
</script>

<OrderListPage />
