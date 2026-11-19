<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import TicketOrderListPage from '$features/ticket-orders/presentation/pages/TicketOrderListPage.svelte';

	pageTitleStore.set('Tiket Pesanan');
</script>

<TicketOrderListPage />
