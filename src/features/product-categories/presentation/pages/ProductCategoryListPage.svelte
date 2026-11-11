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
	import IconCirclePlus from '~icons/lucide/circle-plus';
	import IconSearch from '~icons/lucide/search';
	import IconRefreshCw from '~icons/lucide/refresh-cw';
	import IconEdit2 from '~icons/lucide/edit-2';
	import IconTrash2 from '~icons/lucide/trash-2';
	import IconFolderTree from '~icons/lucide/folder-tree';
	import IconLayers from '~icons/lucide/layers';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconArrowUp from '~icons/lucide/arrow-up';
	import IconArrowDown from '~icons/lucide/arrow-down';
	import IconArrowUpDown from '~icons/lucide/arrow-up-down';
	import {
		type ProductCategory,
		type ProductCategoryInput
	} from '../../domain/product-category.entity';
	import { productCategoryStore } from '../../application/product-category.store.svelte';
	import ProductCategoryFormDialog from '../components/ProductCategoryFormDialog.svelte';
	import ProductCategoryDeleteDialog from '../components/ProductCategoryDeleteDialog.svelte';
	import ProductCategoryOrderDialog from '../components/ProductCategoryOrderDialog.svelte';
	import ProductCategorySpkDialog from '../components/ProductCategorySpkDialog.svelte';

	onMount(() => {
		productCategoryStore.load();
	});

	let isFormOpen = $state(false);
	let selectedCategoryForEdit = $state<ProductCategory | null>(null);

	let isDeleteOpen = $state(false);
	let selectedCategoryForDelete = $state<ProductCategory | null>(null);

	let isOrderOpen = $state(false);
	let selectedCategoryForOrder = $state<ProductCategory | null>(null);

	let isSpkOpen = $state(false);
	let selectedCategoryForSpk = $state<ProductCategory | null>(null);

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

	function openOrderModal(category: ProductCategory) {
		selectedCategoryForOrder = category;
		isOrderOpen = true;
	}

	function openSpkModal(category: ProductCategory) {
		selectedCategoryForSpk = category;
		isSpkOpen = true;
	}

	async function handleSpkSave(targetSpk: string | null): Promise<boolean> {
		if (!selectedCategoryForSpk) return false;
		return await productCategoryStore.update(selectedCategoryForSpk.id, {
			...selectedCategoryForSpk,
			spkCategory: targetSpk
		});
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

	async function handleOrderSave(newOrder: number): Promise<boolean> {
		if (!selectedCategoryForOrder) return false;
		return await productCategoryStore.changeOrder(selectedCategoryForOrder.id, newOrder);
	}

	async function handleMoveUp(item: ProductCategory) {
		await productCategoryStore.moveUp(item.id);
	}

	async function handleMoveDown(item: ProductCategory) {
		await productCategoryStore.moveDown(item.id);
	}

	function getCategoryInitial(name: string): string {
		const trimmed = name.trim();
		if (!trimmed) return '?';
		return trimmed.charAt(0).toUpperCase();
	}

	let currentPage = $state(1);
	let pageSize = $state(10);

	const paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return productCategoryStore.filteredItems.slice(start, start + pageSize);
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconFolderTree class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Master Data Kategori Produk
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola kelompok produk, model satuan hitung (m², lembar A3+, meter lari, pcs), dan status
				operasional.
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
					placeholder="Cari kode atau nama kategori..."
					value={productCategoryStore.searchQuery}
					onValueChange={(val) => {
						productCategoryStore.searchQuery = val;
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
					onclick={() => productCategoryStore.load()}
					disabled={productCategoryStore.isLoading}
					aria-label="Segarkan data"
					title="Segarkan data"
					class="size-8 justify-center! p-0!"
				>
					<IconRefreshCw
						class="size-4 text-foreground-subtle transition-transform {productCategoryStore.isLoading
							? 'animate-spin'
							: ''}"
					/>
				</Button>

				<Button variant="default" size="sm" onclick={openCreateModal} class="shrink-0 gap-1.5">
					<IconCirclePlus class="size-4" />
					<span>Tambah Kategori</span>
				</Button>
			</div>
		</div>

		<!-- Table or State Container -->
		<Card class="overflow-hidden shadow-none">
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
								<IconCirclePlus class="size-4" />
								<span>Tambah Kategori Sekarang</span>
							</Button>
						{/if}
					</EmptyState>
				</div>
			{:else}
				<Table class="rounded-none border-0 bg-transparent">
					<TableHeader>
						<TableRow class="border-b-0 hover:bg-transparent">
							<TableHead class="min-w-60">Nama</TableHead>
							<TableHead class="w-36">Tipe</TableHead>
							<TableHead class="min-w-52">Kategori SPK</TableHead>
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
											{getCategoryInitial(item.name)}
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

								<!-- 2. Tipe (Produksi / Non Produksi) -->
								<TableCell>
									{#if item.type === 'production'}
										<Badge variant="default" size="sm">Produksi</Badge>
									{:else}
										<Badge variant="secondary" size="sm">Non Produksi</Badge>
									{/if}
								</TableCell>

								<!-- 3. Kategori SPK (default / belongs to kategori lain) -->
								<TableCell>
									{#if !item.spkCategory || item.spkCategory === 'default'}
										<button
											type="button"
											class="inline-flex cursor-pointer items-center rounded-md border border-border bg-surface-subtle px-2 py-0.5 text-xs text-foreground-subtle transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-600 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-hidden dark:hover:text-amber-400"
											onclick={() => openSpkModal(item)}
											title="Atur Kategori SPK"
										>
											Default
										</button>
									{:else}
										<button
											type="button"
											class="inline-flex cursor-pointer items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 transition-all hover:border-amber-500/50 hover:bg-amber-500/20 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-hidden dark:text-amber-300"
											onclick={() => openSpkModal(item)}
											title="Atur Kategori SPK"
										>
											{item.spkCategory}
										</button>
									{/if}
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
									{@const sorted = [...productCategoryStore.items].sort(
										(a, b) => a.displayOrder - b.displayOrder
									)}
									{@const fullIdx = sorted.findIndex((i) => i.id === item.id)}
									{@const isFirst = fullIdx === 0}
									{@const isLast = fullIdx === sorted.length - 1}

									<Dropdown
										placement="bottom-end"
										offset={4}
										aria-label="Aksi Kategori"
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

		{#if !productCategoryStore.isLoading && !productCategoryStore.error && productCategoryStore.filteredItems.length > 0}
			<!-- Pagination & Table Controls -->
			<TablePagination
				bind:currentPage
				bind:pageSize
				totalItems={productCategoryStore.filteredItems.length}
				pageSizeOptions={[5, 10, 20]}
				itemLabel="kategori"
			/>
		{/if}
	</div>
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

<!-- Modal Change Display Order -->
<ProductCategoryOrderDialog
	bind:open={isOrderOpen}
	category={selectedCategoryForOrder}
	maxOrder={productCategoryStore.items.length}
	onSave={handleOrderSave}
	onClose={() => (isOrderOpen = false)}
/>

<!-- Modal Atur Kategori SPK -->
<ProductCategorySpkDialog
	bind:open={isSpkOpen}
	category={selectedCategoryForSpk}
	allCategories={productCategoryStore.items}
	onSave={handleSpkSave}
	onClose={() => (isSpkOpen = false)}
/>
