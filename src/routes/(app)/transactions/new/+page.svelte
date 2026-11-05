<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconArrowLeft from '~icons/lucide/arrow-left';
	import IconPrinter from '~icons/lucide/printer';
	import IconReceipt from '~icons/lucide/receipt';
	import IconLayers from '~icons/lucide/layers';
	import IconSparkles from '~icons/lucide/sparkles';
	import IconFileCheck from '~icons/lucide/file-check';

	pageTitleStore.set('Pesanan Baru');

	let selectedCategory = $state<'banner' | 'a3' | 'dtf' | 'merch'>('banner');
	let customerName = $state('Walk-in Customer');
	let phone = $state('081234567890');
	let length = $state(3);
	let width = $state(1);
	let qty = $state(1);
	let paymentType = $state<'lunas' | 'dp'>('dp');

	let area = $derived(length * width);
	let calculatedArea = $derived(Math.max(area, 1.0)); // Min. order 1.0 m²
	let unitPrice = $derived(25000); // Rp 25.000 / m²
	let subtotal = $derived(calculatedArea * unitPrice * qty);
	let dpAmount = $derived(paymentType === 'dp' ? Math.round(subtotal * 0.5) : subtotal);
	let remainingAmount = $derived(subtotal - dpAmount);
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<Button variant="outline" size="sm">
				{#snippet child({ props })}
					<a {...props} href={resolve('/(app)/transactions/tickets')}>
						<IconArrowLeft class="size-4" />
					</a>
				{/snippet}
			</Button>
			<div>
				<Typography variant="h3" as="h1" class="font-bold text-foreground">
					Buat Pesanan & SPK Baru
				</Typography>
				<Typography variant="muted" as="p" class="text-foreground-subtle">
					Kalkulator order cetak cepat, pengaturan finishing, dan penerbitan Surat Perintah Kerja.
				</Typography>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm">
				{#snippet child({ props })}
					<a {...props} href={resolve('/(app)/transactions/tickets')}> Batal </a>
				{/snippet}
			</Button>
			<Button size="sm">
				<IconFileCheck class="mr-1.5 size-4" />
				Simpan & Terbitkan SPK
			</Button>
		</div>
	</div>

	<!-- Category Quick Selector -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<button
			type="button"
			onclick={() => (selectedCategory = 'banner')}
			class={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
				selectedCategory === 'banner'
					? 'border-primary bg-primary/5 text-primary'
					: 'border-border bg-app-surface text-foreground hover:bg-surface-subtle'
			}`}
		>
			<div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
				<IconPrinter class="size-4 text-primary" />
			</div>
			<div>
				<p class="text-xs font-semibold">Large Format</p>
				<p class="text-[10px] text-foreground-subtle">Spanduk & Banner (m²)</p>
			</div>
		</button>

		<button
			type="button"
			onclick={() => (selectedCategory = 'a3')}
			class={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
				selectedCategory === 'a3'
					? 'border-primary bg-primary/5 text-primary'
					: 'border-border bg-app-surface text-foreground hover:bg-surface-subtle'
			}`}
		>
			<div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
				<IconLayers class="size-4 text-primary" />
			</div>
			<div>
				<p class="text-xs font-semibold">Digital A3+</p>
				<p class="text-[10px] text-foreground-subtle">Sticker, Brosur, Kartu Nama</p>
			</div>
		</button>

		<button
			type="button"
			onclick={() => (selectedCategory = 'dtf')}
			class={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
				selectedCategory === 'dtf'
					? 'border-primary bg-primary/5 text-primary'
					: 'border-border bg-app-surface text-foreground hover:bg-surface-subtle'
			}`}
		>
			<div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
				<IconSparkles class="size-4 text-primary" />
			</div>
			<div>
				<p class="text-xs font-semibold">Sablon DTF</p>
				<p class="text-[10px] text-foreground-subtle">Cetak Meter Lari Kaos</p>
			</div>
		</button>

		<button
			type="button"
			onclick={() => (selectedCategory = 'merch')}
			class={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
				selectedCategory === 'merch'
					? 'border-primary bg-primary/5 text-primary'
					: 'border-border bg-app-surface text-foreground hover:bg-surface-subtle'
			}`}
		>
			<div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
				<IconReceipt class="size-4 text-primary" />
			</div>
			<div>
				<p class="text-xs font-semibold">Merchandise</p>
				<p class="text-[10px] text-foreground-subtle">Akrilik, Tumbler, Plakat</p>
			</div>
		</button>
	</div>

	<!-- 2/3 + 1/3 Layout -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Main Form Section (2 Cols) -->
		<div class="flex flex-col gap-6 lg:col-span-2">
			<!-- Customer Information Card -->
			<Card class="bg-app-surface shadow-xs">
				<CardHeader>
					<CardTitle class="text-sm font-semibold text-foreground">Informasi Pelanggan</CardTitle>
				</CardHeader>
				<CardContent class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label
							class="mb-1 block text-xs font-medium text-foreground-subtle"
							for="customer-name"
						>
							Nama Customer / Instansi
						</label>
						<input
							id="customer-name"
							type="text"
							bind:value={customerName}
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						/>
					</div>
					<div>
						<label
							class="mb-1 block text-xs font-medium text-foreground-subtle"
							for="customer-phone"
						>
							Nomor WhatsApp
						</label>
						<input
							id="customer-phone"
							type="text"
							bind:value={phone}
							class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
						/>
					</div>
				</CardContent>
			</Card>

			<!-- Order Specifications Card -->
			<Card class="bg-app-surface shadow-xs">
				<CardHeader>
					<CardTitle class="text-sm font-semibold text-foreground">Spesifikasi Cetak</CardTitle>
				</CardHeader>
				<CardContent class="flex flex-col gap-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label
								class="mb-1 block text-xs font-medium text-foreground-subtle"
								for="material-select"
							>
								Pilihan Bahan Baku
							</label>
							<select
								id="material-select"
								class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
							>
								<option>Flexy Outdoor 280 gsm</option>
								<option selected>Flexy Outdoor 340 gsm (Standar)</option>
								<option>Korea China (Korcin) 440 gsm</option>
								<option>Albatros Eco Indoor</option>
							</select>
						</div>
						<div>
							<label
								class="mb-1 block text-xs font-medium text-foreground-subtle"
								for="finishing-select"
							>
								Finishing Spesifik
							</label>
							<select
								id="finishing-select"
								class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
							>
								<option selected>Mata Ayam (4 Sudut)</option>
								<option>Mata Ayam Keliling (per 1m)</option>
								<option>Seaming / Lipat Lem Keliling</option>
								<option>Potong Pas Gambar</option>
								<option>Lebih Bahan (Margin Putih)</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-3 gap-4 border-t border-border pt-4">
						<div>
							<label
								class="mb-1 block text-xs font-medium text-foreground-subtle"
								for="input-length"
							>
								Panjang (meter)
							</label>
							<input
								id="input-length"
								type="number"
								step="0.1"
								min="0.1"
								bind:value={length}
								class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
							/>
						</div>
						<div>
							<label
								class="mb-1 block text-xs font-medium text-foreground-subtle"
								for="input-width"
							>
								Lebar (meter)
							</label>
							<input
								id="input-width"
								type="number"
								step="0.1"
								min="0.1"
								bind:value={width}
								class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
							/>
						</div>
						<div>
							<label class="mb-1 block text-xs font-medium text-foreground-subtle" for="input-qty">
								Jumlah (Qty)
							</label>
							<input
								id="input-qty"
								type="number"
								min="1"
								bind:value={qty}
								class="h-9 w-full rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
							/>
						</div>
					</div>

					<div class="rounded-md bg-surface-subtle p-3 text-xs text-foreground-subtle">
						<span class="font-semibold text-foreground">Kalkulasi Otomatis:</span>
						Luas cetak adalah
						<span class="font-semibold text-primary">{calculatedArea.toFixed(2)} m²</span>
						(min. order 1.0 m²). Total luas pesanan:
						<span class="font-semibold text-foreground">{(calculatedArea * qty).toFixed(2)} m²</span
						>.
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Payment Summary Panel (1 Col) -->
		<div class="flex flex-col gap-4">
			<Card class="bg-app-surface shadow-xs">
				<CardHeader>
					<CardTitle class="text-sm font-semibold text-foreground">
						Rincian Biaya & Pembayaran
					</CardTitle>
				</CardHeader>
				<CardContent class="flex flex-col gap-3 text-xs">
					<div class="flex justify-between text-foreground-subtle">
						<span>Tarif Bahan</span>
						<span class="font-medium text-foreground"
							>Rp {unitPrice.toLocaleString('id-ID')} / m²</span
						>
					</div>
					<div class="flex justify-between text-foreground-subtle">
						<span>Total Luas Cetak</span>
						<span class="font-medium text-foreground">{(calculatedArea * qty).toFixed(2)} m²</span>
					</div>
					<div class="flex justify-between text-foreground-subtle">
						<span>Biaya Finishing</span>
						<span class="font-medium text-emerald-600 dark:text-emerald-400">Gratis (Standar)</span>
					</div>

					<div class="border-t border-border pt-3">
						<div class="flex justify-between text-sm font-bold text-foreground">
							<span>Total Tagihan</span>
							<span class="text-primary">Rp {subtotal.toLocaleString('id-ID')}</span>
						</div>
					</div>

					<div class="border-t border-border pt-3">
						<span class="mb-2 block font-medium text-foreground-subtle">Skema Pembayaran</span>
						<div class="grid grid-cols-2 gap-2">
							<button
								type="button"
								onclick={() => (paymentType = 'dp')}
								class={`cursor-pointer rounded-md border p-2 text-center text-xs font-medium transition-colors ${
									paymentType === 'dp'
										? 'border-primary bg-primary/10 text-primary'
										: 'border-border bg-canvas text-foreground-subtle'
								}`}
							>
								Uang Muka (DP 50%)
							</button>
							<button
								type="button"
								onclick={() => (paymentType = 'lunas')}
								class={`cursor-pointer rounded-md border p-2 text-center text-xs font-medium transition-colors ${
									paymentType === 'lunas'
										? 'border-primary bg-primary/10 text-primary'
										: 'border-border bg-canvas text-foreground-subtle'
								}`}
							>
								Lunas Penuh (100%)
							</button>
						</div>
					</div>

					<div class="rounded-md bg-surface-subtle p-3 text-xs">
						<div class="flex justify-between">
							<span class="text-foreground-subtle">Wajib Bayar Sekarang:</span>
							<span class="font-bold text-foreground">Rp {dpAmount.toLocaleString('id-ID')}</span>
						</div>
						{#if paymentType === 'dp'}
							<div class="mt-1 flex justify-between text-[11px] text-foreground-faint">
								<span>Sisa Saat Pengambilan:</span>
								<span>Rp {remainingAmount.toLocaleString('id-ID')}</span>
							</div>
						{/if}
					</div>

					<Button size="md" class="mt-2 w-full">
						<IconReceipt class="mr-1.5 size-4" />
						Konfirmasi & Cetak Nota
					</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
