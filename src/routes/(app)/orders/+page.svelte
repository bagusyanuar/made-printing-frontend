<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconFileText from '~icons/lucide/file-text';
	import IconPlus from '~icons/lucide/plus';

	pageTitleStore.set('Order & SPK');
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Manajemen Order & Surat Perintah Kerja (SPK)
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Kelola status SPK dari Draft, Menunggu File, Produksi, hingga Selesai.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Buat SPK Baru
		</Button>
	</div>

	<Card class="bg-app-surface shadow-xs">
		<CardHeader>
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Surat Perintah Kerja
			</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col items-center justify-center py-12 text-center">
			<div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<IconFileText class="size-6" />
			</div>
			<span class="mt-4 text-sm font-semibold text-foreground"> Pencarian & Filter SPK </span>
			<p class="mt-1 max-w-sm text-xs text-foreground-subtle">
				Filter berdasarkan status produksi, prioritas deadline, jenis mesin cetak, atau nama
				pelanggan.
			</p>
		</CardContent>
	</Card>
</div>
