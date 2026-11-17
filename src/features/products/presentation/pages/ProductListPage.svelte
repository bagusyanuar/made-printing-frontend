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
	import IconArrowUp from '~icons/lucide/arrow-up';
	import IconArrowDown from '~icons/lucide/arrow-down';
	import IconArrowUpDown from '~icons/lucide/arrow-up-down';
	import IconTag from '~icons/lucide/tag';
	import IconLayers from '~icons/lucide/layers';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import {
		type Product,
		type ProductInput,
		getCalculationUnit,
		getProductInitial
	} from '../../domain/product.entity';
	import { productStore } from '../../application/product.store.svelte';
	import { productCategoryStore } from '$features/product-categories/application/product-category.store.svelte';
	import ProductFormDialog from '../components/ProductFormDialog.svelte';
	import ProductDeleteDialog from '../components/ProductDeleteDialog.svelte';
	import ProductOrderDialog from '../components/ProductOrderDialog.svelte';

	onMount(() => {
		productStore.load();
		productCategoryStore.load();
	});

	let isFormOpen = $state(false);
	let selectedProductForEdit = $state<Product | null>(null);

	let isDeleteOpen = $state(false);
	let selectedProductForDelete = $state<Product | null>(null);

	let isOrderOpen = $state(false);
	let selectedProductForOrder = $state<Product | null>(null);

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

	function openOrderModal(prod: Product) {
		selectedProductForOrder = prod;
		isOrderOpen = true;
	}

	async function handleOrderSave(newOrder: number): Promise<boolean> {
		if (!selectedProductForOrder) return false;
		const name = selectedProductForOrder.name;
		const success = await productStore.changeOrder(selectedProductForOrder.id, newOrder);
		if (success) {
			toast.success('Urutan produk diperbarui', {
				description: `Produk "${name}" dipindah ke urutan ${newOrder}.`
			});
		} else {
			toast.danger('Gagal mengubah urutan', {
				description: productStore.error || 'Terjadi kesalahan sistem.'
			});
		}
		return success;
	}

	async function handleMoveUp(item: Product) {
		const success = await productStore.moveUp(item.id);
		if (success) {
			toast.success('Urutan dinaikkan', {
				description: `Produk "${item.name}" digeser ke atas.`
			});
		}
	}

	async function handleMoveDown(item: Product) {
		const success = await productStore.moveDown(item.id);
		if (success) {
			toast.success('Urutan diturunkan', {
				description: `Produk "${item.name}" digeser ke bawah.`
			});
		}
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
			return [...productCategoryStore.items]
				.sort((a, b) => a.displayOrder - b.displayOrder)
				.map((c) => ({ id: c.id, name: c.name }));
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
					placeholder="Cari nama atau deskripsi produk..."
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

		<!-- Category Filter Chips (Wrap on overflow) -->
		{#if availableCategories.length > 0}
			<div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter kategori">
				<button
					type="button"
					onclick={() => {
						productStore.selectedCategory = 'all';
						currentPage = 1;
					}}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all {productStore.selectedCategory ===
					'all'
						? 'border-primary/40 bg-primary/10 font-semibold text-primary shadow-2xs'
						: 'hover:border-border-strong border-border bg-surface text-foreground-subtle hover:bg-surface-subtle hover:text-foreground'}"
				>
					<span>Semua</span>
					<span
						class="inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] {productStore.selectedCategory ===
						'all'
							? 'bg-primary/20 font-bold text-primary'
							: 'bg-surface-subtle text-foreground-subtle'}"
					>
						{productStore.items.length}
					</span>
				</button>

				{#each availableCategories as cat (cat.id)}
					{@const count = productStore.items.filter(
						(p) =>
							p.categoryId === cat.id || p.categoryName.toLowerCase() === cat.name.toLowerCase()
					).length}
					{@const isSelected = productStore.selectedCategory === cat.id}
					<button
						type="button"
						onclick={() => {
							productStore.selectedCategory = isSelected ? 'all' : cat.id;
							currentPage = 1;
						}}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all {isSelected
							? 'border-primary/40 bg-primary/10 font-semibold text-primary shadow-2xs'
							: 'hover:border-border-strong border-border bg-surface text-foreground-subtle hover:bg-surface-subtle hover:text-foreground'}"
					>
						<span>{cat.name}</span>
						{#if count > 0}
							<span
								class="inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] {isSelected
									? 'bg-primary/20 font-bold text-primary'
									: 'bg-surface-subtle text-foreground-subtle'}"
							>
								{count}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Table or State Container -->
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
								{productStore.searchQuery || productStore.selectedCategory !== 'all'
									? 'Produk Tidak Ditemukan'
									: 'Belum Ada Data Produk'}
							</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
								{productStore.searchQuery || productStore.selectedCategory !== 'all'
									? 'Tidak ada produk yang cocok dengan pencarian atau filter kategori yang dipilih.'
									: 'Mulai dengan menambahkan produk cetak baru ke dalam katalog.'}
							</Typography>
						{/snippet}
						{#if !productStore.searchQuery && productStore.selectedCategory === 'all'}
							<Button variant="default" size="sm" onclick={openCreateModal} class="mt-2 gap-1.5">
								<IconCirclePlus class="size-4" />
								<span>Tambah Produk Sekarang</span>
							</Button>
						{:else}
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									productStore.searchQuery = '';
									productStore.selectedCategory = 'all';
									currentPage = 1;
								}}
								class="mt-2"
							>
								Reset Filter
							</Button>
						{/if}
					</EmptyState>
				</div>
			{:else}
				<Table class="rounded-none border-0 bg-transparent">
					<TableHeader>
						<TableRow class="border-b-0 hover:bg-transparent">
							<TableHead class="min-w-60">Nama</TableHead>
							<TableHead class="w-40">Kategori</TableHead>
							<TableHead class="w-28">Satuan</TableHead>
							<TableHead class="w-20 text-center">Index</TableHead>
							<TableHead class="w-14 text-right"><span class="sr-only">Aksi</span></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedItems as item (item.id)}
							<TableRow
								class="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/40"
							>
								<!-- 1. Nama -->
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
											{#if item.description}
												<div class="mt-0.5 line-clamp-1 text-xs text-foreground-subtle">
													{item.description}
												</div>
											{/if}
										</div>
									</div>
								</TableCell>

								<!-- 2. Kategori -->
								<TableCell>
									<Badge variant="secondary" size="sm" class="rounded-md text-xs font-normal">
										{item.categoryName}
									</Badge>
								</TableCell>

								<!-- 3. Satuan -->
								<TableCell>
									<span
										class="inline-flex items-center rounded-md border border-border/70 bg-surface-subtle px-2 py-0.5 text-xs font-medium text-foreground"
									>
										{getCalculationUnit(item.calculationType)}
									</span>
								</TableCell>

								<!-- 4. Index (Urutan Display) -->
								<TableCell class="text-center">
									<span
										class="inline-flex size-6 items-center justify-center rounded border border-border/70 bg-surface-subtle text-xs font-medium text-foreground"
									>
										{item.displayOrder}
									</span>
								</TableCell>

								<!-- 5. Aksi (Vertical Ellipsis Dropdown Popover) -->
								<TableCell class="text-right">
									{@const sorted = [...productStore.items].sort(
										(a, b) => a.displayOrder - b.displayOrder
									)}
									{@const fullIdx = sorted.findIndex((i) => i.id === item.id)}
									{@const isFirst = fullIdx === 0}
									{@const isLast = fullIdx === sorted.length - 1}

									<Dropdown
										placement="bottom-end"
										offset={4}
										aria-label="Aksi Produk"
										class="size-8 justify-center! rounded-lg border border-transparent p-0! text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
										classes={{
											trigger: 'size-8 justify-center! p-0!',
											content: 'min-w-40 border-border bg-surface p-1 shadow-none'
										}}
									>
										{#snippet trigger()}
											<IconEllipsisVertical class="size-4" />
										{/snippet}
										<DropdownItem
											disabled={isFirst}
											class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
											onSelect={() => handleMoveUp(item)}
										>
											<IconArrowUp class="size-3.5 text-foreground-subtle" />
											<span>Pindah ke Atas</span>
										</DropdownItem>
										<DropdownItem
											disabled={isLast}
											class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
											onSelect={() => handleMoveDown(item)}
										>
											<IconArrowDown class="size-3.5 text-foreground-subtle" />
											<span>Pindah ke Bawah</span>
										</DropdownItem>
										<DropdownItem
											class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
											onSelect={() => openOrderModal(item)}
										>
											<IconArrowUpDown class="size-3.5 text-foreground-subtle" />
											<span>Ubah Urutan...</span>
										</DropdownItem>

										<div class="my-1 border-t border-border/60"></div>

										<DropdownItem
											class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
											onSelect={() => openEditModal(item)}
										>
											<IconEdit2 class="size-3.5 text-foreground-subtle" />
											<span>Edit</span>
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
			{/if}
		</Card>

		{#if !productStore.isLoading && !productStore.error && productStore.filteredItems.length > 0}
			<!-- Pagination & Table Controls -->
			<TablePagination
				bind:currentPage
				bind:pageSize
				totalItems={productStore.filteredItems.length}
				pageSizeOptions={[5, 10, 20]}
				itemLabel="produk"
			/>
		{/if}
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

<!-- Modal Change Display Order -->
<ProductOrderDialog
	bind:open={isOrderOpen}
	product={selectedProductForOrder}
	maxOrder={productStore.items.length}
	onSave={handleOrderSave}
	onClose={() => {
		isOrderOpen = false;
		selectedProductForOrder = null;
	}}
/>
