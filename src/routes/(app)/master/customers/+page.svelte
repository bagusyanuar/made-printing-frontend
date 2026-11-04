<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import IconUsers from '~icons/lucide/users';

	pageTitleStore.set('Pelanggan & Reseller');
</script>

<div class="flex flex-col gap-6">
	<div>
		<Typography variant="h3" as="h1" class="font-bold text-foreground">
			Master Data Pelanggan & Reseller
		</Typography>
		<Typography variant="muted" as="p" class="text-foreground-subtle">
			Database pelanggan retail, corporate, agen reseller, dan limit plafon piutang/tempo kredit.
		</Typography>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">Daftar Pelanggan</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconUsers class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground">
				Tingkatan Harga & Plafon Kredit
			</span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Harga khusus Reseller Tier A/B/C dan notifikasi jatuh tempo invoice invoice.
			</p>
		</CardContent>
	</Card>
</div>
