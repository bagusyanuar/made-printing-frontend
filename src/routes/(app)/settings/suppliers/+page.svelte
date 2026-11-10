<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { UnderConstructionPage } from '$lib/components/status-pages';

	pageTitleStore.set('Supplier & Pemasok');
</script>

<UnderConstructionPage
	featureName="Supplier & Pemasok"
	category="Master Data Operasional"
	description="Kelola basis data vendor dan mitra pemasok bahan baku cetak (roll continuous, sheet A3+), tinta solvent/DTF, suku cadang mesin, dan perlengkapan finishing percetakan."
	backHref={resolve('/(app)/settings')}
/>

