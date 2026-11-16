<script lang="ts">
	import { onMount } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Avatar } from 'dystopia-linear-lib/components/avatar';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { Dropdown, DropdownItem } from 'dystopia-linear-lib/components/dropdown';
	import { Card } from 'dystopia-linear-lib/components/card';
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
	import { TablePagination } from '$lib/components/table-pagination';
	import { toast } from 'dystopia-linear-lib/components/toast';
	import IconCirclePlus from '~icons/lucide/circle-plus';
	import IconSearch from '~icons/lucide/search';
	import IconRefreshCw from '~icons/lucide/refresh-cw';
	import IconEdit2 from '~icons/lucide/edit-2';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconTag from '~icons/lucide/tag';
	import IconLayers from '~icons/lucide/layers';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import {
		type Product,
		type ProductInput,
		formatCurrency,
		getCalculationLabel,
		getProductInitial
	} from '../../domain/product.entity';
	import { productStore } from '../../application/product.store.svelte';
	import { productCategoryStore } from '$features/product-categories/application/product-category.store.svelte';
	import ProductFormDialog from '../components/ProductFormDialog.svelte';
	import ProductDeleteDialog from '../components/ProductDeleteDialog.svelte';

	onMount(() => {
		productStore.load();
		productCategoryStore.load();
	});

	let isFormOpen = $state(false);
	let selectedProductForEdit = $state<Product | null>(null);

	let isDeleteOpen = $state(false);
	let selectedProductForDelete = $state<Product | null>(null);

	let currentPage = $state(1);
	let pageSize = $state(10);

	function openCreateModal() {
		selectedProductForEdit = null;
		isFormOpen = true;
	}

	function openEditModal(prod: Product) {
		selectedProductForEdit = prod;
		isFormOpen = true;
	}

	function openDeleteModal(prod: Product) {
		selectedProductForDelete = prod;
		isDeleteOpen = true;
	}

	async function handleSave(input: ProductInput): Promise<boolean> {
		if (selectedProductForEdit) {
			const success = await productStore.update(selectedProductForEdit.id, input);
			if (success) {
				toast.success('Produk berhasil diperbarui', {
					description: `Data produk "${input.name}" telah disimpan.`
				});
			} else {
				toast.danger('Gagal memperbarui produk', {
					description: productStore.error || 'Terjadi kesalahan sistem saat memperbarui data.'
				});
			}
			return success;
		}

		const success = await productStore.create(input);
		if (success) {
			toast.success('Produk berhasil dibuat', {
				description: `Produk "${input.name}" berhasil ditambahkan ke katalog.`
			});
		} else {
			toast.danger('Gagal membuat produk', {
				description: productStore.error || 'Terjadi kesalahan sistem saat membuat produk.'
			});
		}
		return success;
	}

	async function handleDelete(): Promise<boolean> {
		if (!selectedProductForDelete) return false;
		const name = selectedProductForDelete.name;
		const success = await productStore.delete(selectedProductForDelete.id);
		if (success) {
			toast.success('Produk berhasil dihapus', {
				description: `Produk "${name}" telah dihapus dari katalog.`
			});
		} else {
			toast.danger('Gagal menghapus produk', {
				description: productStore.error || 'Terjadi kesalahan sistem saat menghapus data.'
			});
		}
		return success;
	}

	const paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return productStore.filteredItems.slice(start, start + pageSize);
	});

	const availableCategories = $derived.by(() => {
		if (productCategoryStore.items.length > 0) {
			return productCategoryStore.items.map((c) => ({ id: c.id, name: c.name }));
		}
		return productStore.categories;
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconTag class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Master Data Produk Cetak
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola katalog produk cetak, spesifikasi bahan baku, model perhitungan harga, dan status
				aktif.
			</Typography>
		</div>
	</div>

	<!-- Content Section: Toolbar, Table, Pagination -->
	<div class="flex flex-col gap-3">
		<!-- Action & Search Toolbar -->
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<!-- Search -->
			<div class="relative w-full max-w-sm">
				<TextField
					size="sm"
					placeholder="Cari kode, nama produk, atau bahan..."
					value={productStore.searchQuery}
					onValueChange={(val) => {
						productStore.searchQuery = val;
						currentPage = 1;
					}}
					class="w-full pl-9"
				/>
				<div
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-foreground-subtle"
				>
					<IconSearch class="size-4" />
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center gap-2 self-start sm:self-auto">
				<Button
					variant="outline"
					size="sm"
					onclick={() => productStore.load()}
					disabled={productStore.isLoading}
					aria-label="Segarkan data"
					title="Segarkan data"
					class="size-8 justify-center! p-0!"
				>
					<IconRefreshCw
						class="size-4 text-foreground-subtle transition-transform {productStore.isLoading
							? 'animate-spin'
							: ''}"
					/>
				</Button>

				<Button variant="default" size="sm" onclick={openCreateModal} class="shrink-0 gap-1.5">
					<IconCirclePlus class="size-4" />
					<span>Tambah Produk</span>
				</Button>
			</div>
		</div>

		<!-- Table Container -->
		<Card class="overflow-hidden shadow-none">
			{#if productStore.isLoading && productStore.items.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Spinner class="size-8 text-primary" />
					<span class="mt-3 text-xs text-foreground-subtle">Memuat katalog produk...</span>
				</div>
			{:else if productStore.error}
				<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
					<IconAlertCircle class="size-8" />
					<span class="mt-2 text-sm font-semibold">Gagal memuat data</span>
					<span class="mt-1 text-xs text-foreground-subtle">{productStore.error}</span>
					<Button variant="outline" size="sm" class="mt-4" onclick={() => productStore.load()}>
						Coba Lagi
					</Button>
				</div>
			{:else if productStore.filteredItems.length === 0}
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
								{productStore.searchQuery ? 'Tidak ada produk yang cocok' : 'Belum ada data produk'}
							</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
								{productStore.searchQuery
									? `Tidak ditemukan produk dengan kata kunci "${productStore.searchQuery}".`
									: 'Mulai dengan menambahkan produk cetak baru ke dalam katalog.'}
							</Typography>
						{/snippet}
						{#if !productStore.searchQuery}
							<Button variant="default" size="sm" onclick={openCreateModal} class="mt-2 gap-1.5">
								<IconCirclePlus class="size-4" />
								<span>Tambah Produk</span>
							</Button>
						{/if}
					</EmptyState>
				</div>
			{:else}
				<Table class="rounded-none border-0 bg-transparent">
					<TableHeader>
						<TableRow class="border-b-0 hover:bg-transparent">
							<TableHead class="min-w-64">Produk Cetak</TableHead>
							<TableHead>Kategori</TableHead>
							<TableHead>Bahan Dasar</TableHead>
							<TableHead>Model Perhitungan</TableHead>
							<TableHead>Harga Dasar</TableHead>
							<TableHead>Status</TableHead>
							<TableHead class="w-16 text-right"><span class="sr-only">Aksi</span></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedItems as item (item.id)}
							<TableRow
								class="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/40"
							>
								<!-- 1. Produk -->
								<TableCell>
									<div class="flex items-center gap-3">
										<Avatar
											alt={item.name}
											class="size-9.5 shrink-0 rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-2xs"
											classes={{ fallback: 'text-sm font-bold text-primary' }}
										>
											{getProductInitial(item.name)}
										</Avatar>
										<div class="flex min-w-0 flex-col">
											<div class="leading-snug font-medium text-foreground">{item.name}</div>
											<div class="mt-0.5 flex items-center gap-1.5 text-xs text-foreground-subtle">
												<span>{item.code}</span>
												{#if item.assignedAttributes && item.assignedAttributes.length > 0}
													<span class="text-foreground-faint">·</span>
													<span class="text-[10px] text-primary">
														{item.assignedAttributes[0].attributeName} ({item.assignedAttributes[0]
															.selectedVariantIds.length} varian)
													</span>
												{/if}
											</div>
										</div>
									</div>
								</TableCell>

								<!-- 2. Kategori -->
								<TableCell>
									<Badge variant="secondary" size="sm" class="rounded-md text-xs font-normal">
										{item.categoryName}
									</Badge>
								</TableCell>

								<!-- 3. Bahan Dasar -->
								<TableCell>
									<span class="text-xs text-foreground-subtle">{item.baseMaterial || '-'}</span>
								</TableCell>

								<!-- 4. Model Perhitungan -->
								<TableCell>
									<span class="text-xs text-foreground-subtle">
										{getCalculationLabel(item.calculationType)}
									</span>
								</TableCell>

								<!-- 5. Harga Dasar -->
								<TableCell>
									<div class="flex flex-col">
										<span class="text-xs font-semibold text-foreground">
											{formatCurrency(item.basePrice)}
										</span>
										{#if item.tierPricing?.resellerPrice}
											<span class="text-[10px] text-foreground-subtle">
												Biro: {formatCurrency(item.tierPricing.resellerPrice)}
											</span>
										{/if}
									</div>
								</TableCell>

								<!-- 6. Status -->
								<TableCell>
									{#if item.isActive}
										<Badge variant="success" size="sm" class="gap-1 rounded-md text-xs font-normal">
											<span class="size-1.5 rounded-full bg-emerald-500"></span>
											<span>Aktif</span>
										</Badge>
									{:else}
										<Badge
											variant="outline"
											size="sm"
											class="gap-1 rounded-md text-xs font-normal text-foreground-subtle"
										>
											<span class="size-1.5 rounded-full bg-foreground-subtle/60"></span>
											<span>Nonaktif</span>
										</Badge>
									{/if}
								</TableCell>

								<!-- 7. Aksi -->
								<TableCell class="text-right">
									<Dropdown
										placement="bottom-end"
										offset={4}
										aria-label="Aksi Produk"
										class="size-8 justify-center! rounded-lg border border-transparent p-0! text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
										classes={{
											trigger: 'size-8 justify-center! p-0!',
											content: 'min-w-36 border-border bg-surface p-1 shadow-none'
										}}
									>
										{#snippet trigger()}
											<IconEllipsisVertical class="size-4" />
										{/snippet}
										<DropdownItem
											class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
											onSelect={() => openEditModal(item)}
										>
											<IconEdit2 class="size-3.5 text-foreground-subtle" />
											<span>Edit Produk</span>
										</DropdownItem>
										<DropdownItem
											class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
											onSelect={() => openDeleteModal(item)}
										>
											<IconTrash2 class="size-3.5 text-danger" />
											<span>Hapus</span>
										</DropdownItem>
									</Dropdown>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>

				<!-- Pagination Container -->
				{#if productStore.filteredItems.length > 0}
					<div class="border-t border-border/60 px-4 py-3">
						<TablePagination
							bind:currentPage
							bind:pageSize
							totalItems={productStore.filteredItems.length}
						/>
					</div>
				{/if}
			{/if}
		</Card>
	</div>
</div>

<!-- Modal Form Dialog -->
<ProductFormDialog
	bind:open={isFormOpen}
	product={selectedProductForEdit}
	categories={availableCategories}
	onSave={handleSave}
	onClose={() => {
		isFormOpen = false;
		selectedProductForEdit = null;
	}}
/>

<!-- Delete Confirmation Dialog -->
<ProductDeleteDialog
	bind:open={isDeleteOpen}
	product={selectedProductForDelete}
	onConfirm={handleDelete}
	onClose={() => {
		isDeleteOpen = false;
		selectedProductForDelete = null;
	}}
/>
