<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconDroplets from '~icons/lucide/droplets';

	pageTitleStore.set('Tinta & Consumables');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Inventaris Tinta & Perlengkapan Cetak
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Monitoring stok Solvent, Eco-Solvent, UV Ink, Toner Laser, Lem Seaming, dan Ring Mata Ayam.
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">
				Persediaan Bahan Penolong
			</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconDroplets class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground">
				Tracking Konsumsi Tinta & Aksesoris
			</span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Peringatan dini stok minimum tinta CMYK + White + Varnish.
			</p>
		</CardContent>
	</Card>
</div>
