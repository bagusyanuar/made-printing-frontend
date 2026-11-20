<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconShoppingBag from '~icons/lucide/shopping-bag';

	pageTitleStore.set('Pesanan Baru');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">Pesanan Baru</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Kalkulator order cetak cepat, pengaturan finishing, dan penerbitan Surat Perintah Kerja (SPK).
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">Modul Pesanan Baru</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-16 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconShoppingBag class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground">
				Siap Memulai Modul Pesanan Baru
			</span>
			<p class="mt-1 max-w-md text-xs text-foreground-subtle">
				Halaman ini disiapkan untuk alur intake pesanan baru (POS / Kasir / kalkulasi order).
			</p>
		</CardContent>
	</Card>
</div>
