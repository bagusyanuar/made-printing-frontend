<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import CreateTicketOrderPage from '$features/ticket-orders/presentation/pages/CreateTicketOrderPage.svelte';

	pageTitleStore.set('Pesanan Baru');
</script>

<CreateTicketOrderPage />
