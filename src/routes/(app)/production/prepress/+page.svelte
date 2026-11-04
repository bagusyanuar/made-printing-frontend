<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconLayers from '~icons/lucide/layers';

	pageTitleStore.set('Pra-Cetak & Nesting');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Pra-Cetak & Nesting Imposition
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Pengecekan resolusi file (preflight), color profile CMYK, dan optimasi tata letak
			lembaran/roll.
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">Workstation Pra-Cetak</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconLayers class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground"> Preflight & Nesting Otomatis </span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Menghitung utilisasi bahan baku dan meminimalkan waste/scrap potongan.
			</p>
		</CardContent>
	</Card>
</div>
