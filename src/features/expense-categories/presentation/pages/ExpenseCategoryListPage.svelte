<script lang="ts">
	import { onMount } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
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
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconReceipt from '~icons/lucide/receipt';
	import IconLayers from '~icons/lucide/layers';
	import type { ExpenseCategory, ExpenseCategoryInput } from '../../domain/expense-category.entity';
	import { expenseCategoryStore } from '../../application/expense-category.store.svelte';
	import ExpenseCategoryFormDialog from '../components/ExpenseCategoryFormDialog.svelte';
	import ExpenseCategoryDeleteDialog from '../components/ExpenseCategoryDeleteDialog.svelte';
	import ExpenseCategoryOrderDialog from '../components/ExpenseCategoryOrderDialog.svelte';

	onMount(() => {
		expenseCategoryStore.load();
	});

	let isFormOpen = $state(false);
	let selectedCategoryForEdit = $state<ExpenseCategory | null>(null);

	let isDeleteOpen = $state(false);
	let selectedCategoryForDelete = $state<ExpenseCategory | null>(null);

	let isOrderOpen = $state(false);
	let selectedCategoryForOrder = $state<ExpenseCategory | null>(null);

	let currentPage = $state(1);
	let pageSize = $state(10);

	function openCreateModal() {
		selectedCategoryForEdit = null;
		isFormOpen = true;
	}

	function openEditModal(category: ExpenseCategory) {
		selectedCategoryForEdit = category;
		isFormOpen = true;
	}

	function openDeleteModal(category: ExpenseCategory) {
		selectedCategoryForDelete = category;
		isDeleteOpen = true;
	}

	function openOrderModal(category: ExpenseCategory) {
		selectedCategoryForOrder = category;
		isOrderOpen = true;
	}

	async function handleOrderSave(newOrder: number): Promise<boolean> {
		if (!selectedCategoryForOrder) return false;
		const name = selectedCategoryForOrder.name;
		const success = await expenseCategoryStore.changeOrder(selectedCategoryForOrder.id, newOrder);
		if (success) {
			toast.success('Urutan kategori diperbarui', {
				description: `Kategori "${name}" dipindah ke urutan ${newOrder}.`
			});
		} else {
			toast.danger('Gagal mengubah urutan', {
				description: expenseCategoryStore.error || 'Terjadi kesalahan sistem saat mengubah urutan.'
			});
		}
		return success;
	}

	async function handleMoveUp(item: ExpenseCategory) {
		const success = await expenseCategoryStore.moveUp(item.id);
		if (success) {
			toast.success('Urutan dinaikkan', {
				description: `Kategori "${item.name}" digeser ke atas.`
			});
		}
	}

	async function handleMoveDown(item: ExpenseCategory) {
		const success = await expenseCategoryStore.moveDown(item.id);
		if (success) {
			toast.success('Urutan diturunkan', {
				description: `Kategori "${item.name}" digeser ke bawah.`
			});
		}
	}

	async function handleSave(input: ExpenseCategoryInput): Promise<boolean> {
		if (selectedCategoryForEdit) {
			const success = await expenseCategoryStore.update(selectedCategoryForEdit.id, input);
			if (success) {
				toast.success('Kategori pengeluaran diperbarui', {
					description: `Data kategori "${input.name}" telah disimpan.`
				});
			} else {
				toast.danger('Gagal memperbarui kategori', {
					description:
						expenseCategoryStore.error || 'Terjadi kesalahan sistem saat memperbarui data.'
				});
			}
			return success;
		}

		const success = await expenseCategoryStore.create(input);
		if (success) {
			toast.success('Kategori pengeluaran ditambahkan', {
				description: `Kategori "${input.name}" berhasil didaftarkan.`
			});
		} else {
			toast.danger('Gagal menambahkan kategori', {
				description:
					expenseCategoryStore.error || 'Terjadi kesalahan sistem saat mendaftarkan data.'
			});
		}
		return success;
	}

	async function handleDelete(): Promise<boolean> {
		if (!selectedCategoryForDelete) return false;
		const name = selectedCategoryForDelete.name;
		const success = await expenseCategoryStore.delete(selectedCategoryForDelete.id);
		if (success) {
			toast.success('Kategori berhasil dihapus', {
				description: `Kategori "${name}" telah dihapus dari sistem.`
			});
		} else {
			toast.danger('Gagal menghapus kategori', {
				description: expenseCategoryStore.error || 'Terjadi kesalahan sistem saat menghapus data.'
			});
		}
		return success;
	}

	const paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return expenseCategoryStore.filteredItems.slice(start, start + pageSize);
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconReceipt class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Master Kategori Pengeluaran
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola pos klasifikasi biaya operasional percetakan, pengelompokan biaya produksi terkait
				produk, dan indexing urutan form.
			</Typography>
		</div>
	</div>

	<!-- Content Section: Toolbar, Filter Tabs, Table, Pagination -->
	<div class="flex flex-col gap-3">
		<!-- Action & Search Toolbar -->
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<!-- Search & Group Filters -->
			<div class="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
				<div class="relative w-full max-w-sm">
					<TextField
						size="sm"
						placeholder="Cari nama pos pengeluaran, kategori produk..."
						value={expenseCategoryStore.searchQuery}
						onValueChange={(val) => {
							expenseCategoryStore.searchQuery = val;
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

				<!-- Group Filter Chips -->
				<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
					<button
						type="button"
						onclick={() => {
							expenseCategoryStore.selectedGroup = 'all';
							currentPage = 1;
						}}
						class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {expenseCategoryStore.selectedGroup ===
						'all'
							? 'bg-primary text-primary-foreground shadow-2xs'
							: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:bg-surface-subtle/80 hover:text-foreground'}"
					>
						Semua ({expenseCategoryStore.totalCategories})
					</button>
					<button
						type="button"
						onclick={() => {
							expenseCategoryStore.selectedGroup = 'production';
							currentPage = 1;
						}}
						class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {expenseCategoryStore.selectedGroup ===
						'production'
							? 'bg-primary text-primary-foreground shadow-2xs'
							: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:bg-surface-subtle/80 hover:text-foreground'}"
					>
						Produksi ({expenseCategoryStore.productionCategories})
					</button>
					<button
						type="button"
						onclick={() => {
							expenseCategoryStore.selectedGroup = 'operational';
							currentPage = 1;
						}}
						class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {expenseCategoryStore.selectedGroup ===
						'operational'
							? 'bg-primary text-primary-foreground shadow-2xs'
							: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:bg-surface-subtle/80 hover:text-foreground'}"
					>
						Operasional ({expenseCategoryStore.operationalCategories})
					</button>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center gap-2 self-start sm:self-auto">
				<Button
					variant="outline"
					size="sm"
					onclick={() => expenseCategoryStore.load()}
					disabled={expenseCategoryStore.isLoading}
					aria-label="Segarkan data"
					title="Segarkan data"
					class="size-8 justify-center! p-0!"
				>
					<IconRefreshCw
						class="size-4 text-foreground-subtle transition-transform {expenseCategoryStore.isLoading
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

		<!-- Table Container -->
		<Card class="overflow-hidden shadow-none">
			{#if expenseCategoryStore.isLoading && expenseCategoryStore.items.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Spinner class="size-8 text-primary" />
					<span class="mt-3 text-xs text-foreground-subtle">Memuat kategori pengeluaran...</span>
				</div>
			{:else if expenseCategoryStore.error}
				<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
					<IconAlertCircle class="size-8" />
					<span class="mt-2 text-sm font-semibold">Gagal memuat data</span>
					<span class="mt-1 text-xs text-foreground-subtle">{expenseCategoryStore.error}</span>
					<Button
						variant="outline"
						size="sm"
						class="mt-4"
						onclick={() => expenseCategoryStore.load()}
					>
						Coba Lagi
					</Button>
				</div>
			{:else if expenseCategoryStore.filteredItems.length === 0}
				<div class="py-12">
					<EmptyState>
						{#snippet icon()}
							<div
								class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<IconReceipt class="size-6" />
							</div>
						{/snippet}
						{#snippet title()}
							<Typography variant="h4" as="span" class="font-semibold text-foreground">
								{expenseCategoryStore.searchQuery || expenseCategoryStore.selectedGroup !== 'all'
									? 'Kategori Tidak Ditemukan'
									: 'Belum Ada Kategori Pengeluaran'}
							</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
								{expenseCategoryStore.searchQuery || expenseCategoryStore.selectedGroup !== 'all'
									? 'Tidak ada kategori pengeluaran yang cocok dengan filter atau kata kunci pencarian.'
									: 'Mulai daftarkan pos biaya produksi dan operasional percetakan Anda.'}
							</Typography>
						{/snippet}
						{#if !expenseCategoryStore.searchQuery && expenseCategoryStore.selectedGroup === 'all'}
							<Button variant="default" size="sm" onclick={openCreateModal} class="mt-2 gap-1.5">
								<IconCirclePlus class="size-4" />
								<span>Tambah Kategori Sekarang</span>
							</Button>
						{:else}
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									expenseCategoryStore.searchQuery = '';
									expenseCategoryStore.selectedGroup = 'all';
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
							<TableHead class="min-w-64">Nama Kategori</TableHead>
							<TableHead class="w-36">Grup</TableHead>
							<TableHead class="min-w-64">Kategori Produk Terkait</TableHead>
							<TableHead class="w-20 text-center">Index</TableHead>
							<TableHead class="w-14 text-right"><span class="sr-only">Aksi</span></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedItems as item (item.id)}
							<TableRow
								class="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/40"
							>
								<!-- 1. Nama Kategori -->
								<TableCell>
									<div class="flex items-center gap-3">
										<div
											class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface-subtle text-foreground-subtle"
										>
											<IconReceipt class="size-4" />
										</div>
										<span class="leading-snug font-medium text-foreground">{item.name}</span>
									</div>
								</TableCell>

								<!-- 2. Grup (Produksi / Operasional) -->
								<TableCell>
									{#if item.group === 'production'}
										<Badge variant="default" size="sm">Produksi</Badge>
									{:else}
										<Badge variant="secondary" size="sm">Operasional</Badge>
									{/if}
								</TableCell>

								<!-- 3. Kategori Produk Terkait -->
								<TableCell>
									{#if item.group === 'production' && item.productCategoryName}
										<div class="flex items-center gap-1.5 text-xs text-foreground">
											<IconLayers class="size-3.5 shrink-0 text-primary" />
											<span class="font-medium">{item.productCategoryName}</span>
										</div>
									{:else if item.group === 'production'}
										<span class="text-xs text-danger">Belum ditautkan</span>
									{:else}
										<span class="text-xs text-foreground-subtle">-</span>
									{/if}
								</TableCell>

								<!-- 4. Index (Urutan Display) -->
								<TableCell class="text-center">
									<button
										type="button"
										onclick={() => openOrderModal(item)}
										class="group inline-flex size-6 cursor-pointer items-center justify-center rounded border border-border/70 bg-surface-subtle text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
										title="Ubah nomor urut lookup"
									>
										{item.displayOrder}
									</button>
								</TableCell>

								<!-- 5. Aksi (Vertical Ellipsis Dropdown Popover) -->
								<TableCell class="text-right">
									{@const sorted = [...expenseCategoryStore.items].sort(
										(a, b) => a.displayOrder - b.displayOrder
									)}
									{@const fullIdx = sorted.findIndex((i) => i.id === item.id)}
									{@const isFirst = fullIdx === 0}
									{@const isLast = fullIdx === sorted.length - 1}

									<Dropdown
										placement="bottom-end"
										offset={4}
										aria-label="Aksi Kategori Pengeluaran"
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

		{#if !expenseCategoryStore.isLoading && !expenseCategoryStore.error && expenseCategoryStore.filteredItems.length > 0}
			<!-- Pagination & Table Controls -->
			<TablePagination
				bind:currentPage
				bind:pageSize
				totalItems={expenseCategoryStore.filteredItems.length}
				pageSizeOptions={[5, 10, 20]}
				itemLabel="kategori"
			/>
		{/if}
	</div>
</div>

<!-- Modal Form Dialog -->
<ExpenseCategoryFormDialog
	bind:open={isFormOpen}
	category={selectedCategoryForEdit}
	defaultOrder={expenseCategoryStore.items.length + 1}
	onSave={handleSave}
	onClose={() => {
		isFormOpen = false;
		selectedCategoryForEdit = null;
	}}
/>

<!-- Delete Confirmation Dialog -->
<ExpenseCategoryDeleteDialog
	bind:open={isDeleteOpen}
	category={selectedCategoryForDelete}
	onConfirm={handleDelete}
	onClose={() => {
		isDeleteOpen = false;
		selectedCategoryForDelete = null;
	}}
/>

<!-- Modal Change Display Order -->
<ExpenseCategoryOrderDialog
	bind:open={isOrderOpen}
	category={selectedCategoryForOrder}
	maxOrder={expenseCategoryStore.items.length}
	onSave={handleOrderSave}
	onClose={() => {
		isOrderOpen = false;
		selectedCategoryForOrder = null;
	}}
/>
