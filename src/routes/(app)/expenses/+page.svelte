<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import ExpenseListPage from '$features/expenses/presentation/pages/ExpenseListPage.svelte';

	pageTitleStore.set('Pengeluaran');
</script>

<ExpenseListPage />
