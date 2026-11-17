<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import ResellerListPage from '$features/resellers/presentation/pages/ResellerListPage.svelte';

	pageTitleStore.set('Biro & Reseller');
</script>

<ResellerListPage />
