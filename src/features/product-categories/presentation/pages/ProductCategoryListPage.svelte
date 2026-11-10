<script lang="ts">
	import { onMount } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { Select } from 'dystopia-linear-lib/components/select';
	import { Card, CardContent } from 'dystopia-linear-lib/components/card';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell
	} from 'dystopia-linear-lib/components/table';
	import { EmptyState } from 'dystopia-linear-lib/components/empty-state';
	import { Spinner } from 'dystopia-linear-lib/components/spinner';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconEdit2 from '~icons/lucide/edit-2';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconFolderTree from '~icons/lucide/folder-tree';
	import IconLayers from '~icons/lucide/layers';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconCalculator from '~icons/lucide/calculator';
	import {
		CALCULATION_TYPES,
		type CalculationType,
		type ProductCategory,
		type ProductCategoryInput
	} from '../../domain/product-category.entity';
	import { productCategoryStore } from '../../application/product-category.store.svelte';
	import ProductCategoryFormDialog from '../components/ProductCategoryFormDialog.svelte';
	import ProductCategoryDeleteDialog from '../components/ProductCategoryDeleteDialog.svelte';

	onMount(() => {
		productCategoryStore.load();
	});

	let isFormOpen = $state(false);
	let selectedCategoryForEdit = $state<ProductCategory | null>(null);

	let isDeleteOpen = $state(false);
	let selectedCategoryForDelete = $state<ProductCategory | null>(null);

	function openCreateModal() {
		selectedCategoryForEdit = null;
		isFormOpen = true;
	}

	function openEditModal(category: ProductCategory) {
		selectedCategoryForEdit = category;
		isFormOpen = true;
	}

	function openDeleteModal(category: ProductCategory) {
		selectedCategoryForDelete = category;
		isDeleteOpen = true;
	}

	async function handleSave(input: ProductCategoryInput): Promise<boolean> {
		if (selectedCategoryForEdit) {
			return await productCategoryStore.update(selectedCategoryForEdit.id, input);
		}
		return await productCategoryStore.create(input);
	}

	async function handleDelete(): Promise<boolean> {
		if (!selectedCategoryForDelete) return false;
		return await productCategoryStore.delete(selectedCategoryForDelete.id);
	}

	function getCalculationTypeBadge(type: CalculationType) {
		switch (type) {
			case 'square_meter':
				return {
					label: 'Meter Persegi (m²)',
					colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
				};
			case 'sheet':
				return {
					label: 'Lembaran (A3+)',
					colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
				};
			case 'meter_run':
				return {
					label: 'Meter Lari (m)',
					colorClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
				};
			case 'piece':
				return {
					label: 'Pcs / Unit',
					colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
				};
		}
	}

	const totalCount = $derived(productCategoryStore.items.length);
	const activeCount = $derived(productCategoryStore.items.filter((i) => i.isActive).length);
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<Typography variant="h2" as="h1" class="font-bold text-foreground">
				Master Data Kategori Produk
			</Typography>
			<Typography variant="muted" as="p" class="mt-1 text-foreground-subtle">
				Kelola kelompok produk, model satuan hitung (m², lembar A3+, meter lari, pcs), dan status
				operasional.
			</Typography>
		</div>

		<Button variant="default" size="sm" onclick={openCreateModal} class="shrink-0 gap-1.5">
			<IconPlus class="size-4" />
			<span>Tambah Kategori</span>
		</Button>
	</div>

	<!-- Metric Quick Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<Card class="bg-app-surface shadow-xs">
			<CardContent class="flex items-center gap-4 p-4">
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
				>
					<IconFolderTree class="size-5" />
				</div>
				<div>
					<span class="text-xs font-medium text-foreground-subtle">Total Kategori</span>
					<div class="text-xl font-bold text-foreground">{totalCount}</div>
				</div>
			</CardContent>
		</Card>

		<Card class="bg-app-surface shadow-xs">
			<CardContent class="flex items-center gap-4 p-4">
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
				>
					<IconCheckCircle2 class="size-5" />
				</div>
				<div>
					<span class="text-xs font-medium text-foreground-subtle">Kategori Aktif</span>
					<div class="text-xl font-bold text-foreground">{activeCount}</div>
				</div>
			</CardContent>
		</Card>

		<Card class="bg-app-surface shadow-xs">
			<CardContent class="flex items-center gap-4 p-4">
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"
				>
					<IconCalculator class="size-5" />
				</div>
				<div>
					<span class="text-xs font-medium text-foreground-subtle">Model Satuan Hitung</span>
					<div class="text-xl font-bold text-foreground">4 Satuan</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Filters & Search Toolbar -->
	<Card class="bg-app-surface shadow-xs">
		<CardContent class="p-4">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<!-- Search -->
				<div class="relative w-full max-w-sm">
					<TextField
						placeholder="Cari kode atau nama kategori..."
						value={productCategoryStore.searchQuery}
						onValueChange={(val) => (productCategoryStore.searchQuery = val)}
						class="w-full pl-9"
					/>
					<div
						class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-foreground-subtle"
					>
						<IconSearch class="size-4" />
					</div>
				</div>

				<!-- Filters -->
				<div class="flex flex-wrap items-center gap-3">
					<div class="w-48">
						<Select
							value={productCategoryStore.selectedCalculationType}
							onValueChange={(val) =>
								(productCategoryStore.selectedCalculationType = val as CalculationType | 'all')}
							class="w-full text-xs"
						>
							<option value="all">Semua Satuan Hitung</option>
							{#each CALCULATION_TYPES as opt (opt.value)}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</Select>
					</div>

					<div class="w-36">
						<Select
							value={productCategoryStore.statusFilter}
							onValueChange={(val) =>
								(productCategoryStore.statusFilter = val as 'all' | 'active' | 'inactive')}
							class="w-full text-xs"
						>
							<option value="all">Semua Status</option>
							<option value="active">Aktif</option>
							<option value="inactive">Non-aktif</option>
						</Select>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Table or State Container -->
	<Card class="overflow-hidden bg-app-surface shadow-xs">
		{#if productCategoryStore.isLoading && productCategoryStore.items.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<Spinner class="size-8 text-primary" />
				<span class="mt-3 text-xs text-foreground-subtle">Memuat data kategori produk...</span>
			</div>
		{:else if productCategoryStore.error}
			<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
				<IconAlertCircle class="size-8" />
				<span class="mt-2 text-sm font-semibold">Gagal memuat data</span>
				<span class="mt-1 text-xs text-foreground-subtle">{productCategoryStore.error}</span>
				<Button
					variant="outline"
					size="sm"
					class="mt-4"
					onclick={() => productCategoryStore.load()}
				>
					Coba Lagi
				</Button>
			</div>
		{:else if productCategoryStore.filteredItems.length === 0}
			<div class="py-12">
				<EmptyState>
					{#snippet icon()}
						<div
							class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<IconLayers class="size-6" />
						</div>
					{/snippet}
					{#snippet title()}
						<Typography variant="h4" as="span" class="font-semibold text-foreground">
							{productCategoryStore.searchQuery
								? 'Kategori Tidak Ditemukan'
								: 'Belum Ada Kategori Produk'}
						</Typography>
					{/snippet}
					{#snippet description()}
						<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
							{productCategoryStore.searchQuery
								? `Tidak ada kategori yang cocok dengan "${productCategoryStore.searchQuery}".`
								: 'Tambahkan kategori produk pertama Anda untuk mulai mengorganisasi produk cetak.'}
						</Typography>
					{/snippet}

					{#if !productCategoryStore.searchQuery}
						<Button variant="default" size="sm" onclick={openCreateModal} class="mt-2 gap-1.5">
							<IconPlus class="size-4" />
							<span>Tambah Kategori Sekarang</span>
						</Button>
					{/if}
				</EmptyState>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow class="bg-surface-subtle/50">
							<TableHead class="w-32 font-semibold text-foreground">Kode</TableHead>
							<TableHead class="min-w-56 font-semibold text-foreground">Nama Kategori</TableHead>
							<TableHead class="min-w-44 font-semibold text-foreground"
								>Model Satuan Hitung</TableHead
							>
							<TableHead class="w-28 font-semibold text-foreground">Status</TableHead>
							<TableHead class="w-36 text-right font-semibold text-foreground">Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each productCategoryStore.filteredItems as item (item.id)}
							{@const calcBadge = getCalculationTypeBadge(item.calculationType)}
							<TableRow class="transition-colors hover:bg-surface-hover/50">
								<!-- Kode -->
								<TableCell class="font-mono text-xs font-semibold text-foreground">
									<span class="rounded-md border border-border bg-surface-subtle px-2 py-0.5">
										{item.code}
									</span>
								</TableCell>

								<!-- Nama & Deskripsi -->
								<TableCell>
									<div class="font-medium text-foreground">{item.name}</div>
									{#if item.description}
										<div class="mt-0.5 line-clamp-1 text-xs text-foreground-subtle">
											{item.description}
										</div>
									{/if}
								</TableCell>

								<!-- Model Satuan Hitung -->
								<TableCell>
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {calcBadge.colorClass}"
									>
										{calcBadge.label}
									</span>
								</TableCell>

								<!-- Status -->
								<TableCell>
									{#if item.isActive}
										<Badge variant="success" size="sm">Aktif</Badge>
									{:else}
										<Badge variant="secondary" size="sm">Non-aktif</Badge>
									{/if}
								</TableCell>

								<!-- Actions -->
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<button
											type="button"
											class="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
											onclick={() => openEditModal(item)}
											title="Edit Kategori"
											aria-label="Edit Kategori"
										>
											<IconEdit2 class="size-4" />
										</button>
										<button
											type="button"
											class="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-danger/10 hover:text-danger"
											onclick={() => openDeleteModal(item)}
											title="Hapus Kategori"
											aria-label="Hapus Kategori"
										>
											<IconTrash2 class="size-4" />
										</button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		{/if}
	</Card>
</div>

<!-- Modal Form Create / Edit -->
<ProductCategoryFormDialog
	bind:open={isFormOpen}
	category={selectedCategoryForEdit}
	onSave={handleSave}
	onClose={() => (isFormOpen = false)}
/>

<!-- Modal Delete Confirmation -->
<ProductCategoryDeleteDialog
	bind:open={isDeleteOpen}
	category={selectedCategoryForDelete}
	onConfirm={handleDelete}
	onClose={() => (isDeleteOpen = false)}
/>
