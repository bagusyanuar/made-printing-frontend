<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import ExpenseCategoryListPage from '$features/expense-categories/presentation/pages/ExpenseCategoryListPage.svelte';

	pageTitleStore.set('Kategori Pengeluaran');
</script>

<ExpenseCategoryListPage />
