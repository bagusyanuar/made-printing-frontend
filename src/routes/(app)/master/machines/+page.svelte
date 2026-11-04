<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconWrench from '~icons/lucide/wrench';

	pageTitleStore.set('Mesin Percetakan');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Master Data Mesin Percetakan
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Spesifikasi mesin, kecepatan cetak per jam, biaya click-count, dan jadwal maintenance berkala.
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Armada Mesin Cetak
			</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconWrench class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground"> Profil & Tarif Mesin </span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Menentukan routing otomatis SPK ke mesin yang paling optimal secara biaya dan waktu.
			</p>
		</CardContent>
	</Card>
</div>
