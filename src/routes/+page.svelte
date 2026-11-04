<script lang="ts">
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from 'dystopia-linear-lib/components/card';
	import { Typography } from 'dystopia-linear-lib/components/typography';

	let isDarkMode = $state(false);

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			document.documentElement.dataset.theme = 'dark';
		} else {
			document.documentElement.classList.remove('dark');
			delete document.documentElement.dataset.theme;
		}
	}
</script>

<svelte:head>
	<title>Made Printing ERP — Design System Showcase</title>
</svelte:head>

<main class="min-h-screen bg-surface px-6 py-12 transition-colors duration-200">
	<div class="mx-auto max-w-4xl space-y-8">
		<!-- Header -->
		<header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<div class="flex items-center gap-2">
					<Typography variant="h2" as="h1" class="font-bold text-primary">
						Made Printing ERP
					</Typography>
					<Badge variant="default">Brand Red Active</Badge>
				</div>
				<Typography variant="muted" class="mt-1">
					Sistem ERP & POS Percetakan Digital — Token Primary Red Override Test
				</Typography>
			</div>

			<Button variant="outline" onclick={toggleTheme}>
				{isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
			</Button>
		</header>

		<!-- Card Preview -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Order Card Preview -->
			<Card class="border-border">
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle>SPK-202611-0001</CardTitle>
						<Badge variant="default">Sedang Cetak</Badge>
					</div>
					<CardDescription>Cetak Banner Outdoor 3.2m</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="text-sm">
						<span class="text-foreground-muted">Pelanggan:</span>
						<strong class="ml-1 text-foreground">PT Sinar Grafika Utama</strong>
					</div>
					<div class="text-sm">
						<span class="text-foreground-muted">Bahan:</span>
						<span class="ml-1 text-foreground">Flexy Korea 440 gsm (3.0 × 1.0 m)</span>
					</div>
					<div class="text-sm">
						<span class="text-foreground-muted">Finishing:</span>
						<span class="ml-1 text-foreground">Mata Ayam 4 Sudut + Seaming</span>
					</div>
				</CardContent>
				<CardFooter class="flex justify-end gap-2">
					<Button variant="outline" size="sm">Cek File RIP</Button>
					<Button variant="default" size="sm">Update SPK</Button>
				</CardFooter>
			</Card>

			<!-- Action & Component Preview -->
			<Card class="border-border">
				<CardHeader>
					<CardTitle>Preview Kontrol & Tombol</CardTitle>
					<CardDescription>Komponen dystopia-linear-lib dengan token merah</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex flex-wrap gap-2">
						<Button variant="default">Primary Red</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
					</div>
					<div class="flex flex-wrap gap-2">
						<Badge variant="default">Badge Primary</Badge>
						<Badge variant="outline">Badge Outline</Badge>
					</div>
				</CardContent>
				<CardFooter>
					<Typography variant="small" class="text-foreground-muted">
						Token --primary: var(--color-red-600) / dark: var(--color-red-500)
					</Typography>
				</CardFooter>
			</Card>
		</div>
	</div>
</main>
