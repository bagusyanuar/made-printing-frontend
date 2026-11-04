<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconPackage from '~icons/lucide/package';

	pageTitleStore.set('Katalog Bahan Baku');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Master Data Bahan Baku
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Konfigurasi jenis bahan, gramatur, lebar roll, dimensi lembaran, dan harga modal (COGS).
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">Daftar Bahan Percetakan</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconPackage class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground"> Database Bahan Baku </span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Menghitung HPP otomatis berdasarkan harga beli supplier dan waste tolerance.
			</p>
		</CardContent>
	</Card>
</div>
