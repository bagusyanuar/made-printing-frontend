<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconPrinter from '~icons/lucide/printer';

	pageTitleStore.set('Antrean Mesin Cetak');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Antrean Mesin Percetakan
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Penjadwalan antrean SPK cetak, grouping bahan sejenis, dan minimalisasi changeover.
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">Jadwal Antrean Mesin</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconPrinter class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground">
				Antrean Mesin Digital & Offset
			</span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Manajemen alur cetak Outdoor, Indoor, Sheetfed A3+, UV Flatbed, dan DTF.
			</p>
		</CardContent>
	</Card>
</div>
