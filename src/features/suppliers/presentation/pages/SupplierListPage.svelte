<script lang="ts">
	import { onMount } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
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
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconTruck from '~icons/lucide/truck';
	import IconPhone from '~icons/lucide/phone';
	import IconMail from '~icons/lucide/mail';
	import IconUser from '~icons/lucide/user';
	import {
		type Supplier,
		type SupplierInput,
		getSupplierInitial
	} from '../../domain/supplier.entity';
	import { supplierStore } from '../../application/supplier.store.svelte';
	import SupplierFormDialog from '../components/SupplierFormDialog.svelte';
	import SupplierDeleteDialog from '../components/SupplierDeleteDialog.svelte';
	import SupplierOrderDialog from '../components/SupplierOrderDialog.svelte';

	onMount(() => {
		supplierStore.load();
	});

	let isFormOpen = $state(false);
	let selectedSupplierForEdit = $state<Supplier | null>(null);

	let isDeleteOpen = $state(false);
	let selectedSupplierForDelete = $state<Supplier | null>(null);

	let isOrderOpen = $state(false);
	let selectedSupplierForOrder = $state<Supplier | null>(null);

	let currentPage = $state(1);
	let pageSize = $state(10);

	function openCreateModal() {
		selectedSupplierForEdit = null;
		isFormOpen = true;
	}

	function openEditModal(supplier: Supplier) {
		selectedSupplierForEdit = supplier;
		isFormOpen = true;
	}

	function openDeleteModal(supplier: Supplier) {
		selectedSupplierForDelete = supplier;
		isDeleteOpen = true;
	}

	function openOrderModal(supplier: Supplier) {
		selectedSupplierForOrder = supplier;
		isOrderOpen = true;
	}

	async function handleOrderSave(newOrder: number): Promise<boolean> {
		if (!selectedSupplierForOrder) return false;
		const name = selectedSupplierForOrder.name;
		const success = await supplierStore.changeOrder(selectedSupplierForOrder.id, newOrder);
		if (success) {
			toast.success('Urutan supplier diperbarui', {
				description: `Supplier "${name}" dipindah ke urutan ${newOrder}.`
			});
		} else {
			toast.danger('Gagal mengubah urutan', {
				description: supplierStore.error || 'Terjadi kesalahan sistem saat mengubah urutan.'
			});
		}
		return success;
	}

	async function handleMoveUp(item: Supplier) {
		const success = await supplierStore.moveUp(item.id);
		if (success) {
			toast.success('Urutan dinaikkan', {
				description: `Supplier "${item.name}" digeser ke atas.`
			});
		}
	}

	async function handleMoveDown(item: Supplier) {
		const success = await supplierStore.moveDown(item.id);
		if (success) {
			toast.success('Urutan diturunkan', {
				description: `Supplier "${item.name}" digeser ke bawah.`
			});
		}
	}

	async function handleSave(input: SupplierInput): Promise<boolean> {
		if (selectedSupplierForEdit) {
			const success = await supplierStore.update(selectedSupplierForEdit.id, input);
			if (success) {
				toast.success('Data supplier berhasil diperbarui', {
					description: `Data vendor "${input.name}" telah disimpan.`
				});
			} else {
				toast.danger('Gagal memperbarui data', {
					description: supplierStore.error || 'Terjadi kesalahan sistem saat memperbarui data.'
				});
			}
			return success;
		}

		const success = await supplierStore.create(input);
		if (success) {
			toast.success('Supplier berhasil ditambahkan', {
				description: `Vendor "${input.name}" berhasil didaftarkan.`
			});
		} else {
			toast.danger('Gagal menambahkan supplier', {
				description: supplierStore.error || 'Terjadi kesalahan sistem saat mendaftarkan data.'
			});
		}
		return success;
	}

	async function handleDelete(): Promise<boolean> {
		if (!selectedSupplierForDelete) return false;
		const name = selectedSupplierForDelete.name;
		const success = await supplierStore.delete(selectedSupplierForDelete.id);
		if (success) {
			toast.success('Data supplier berhasil dihapus', {
				description: `Vendor "${name}" telah dihapus dari sistem.`
			});
		} else {
			toast.danger('Gagal menghapus supplier', {
				description: supplierStore.error || 'Terjadi kesalahan sistem saat menghapus data.'
			});
		}
		return success;
	}

	const paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return supplierStore.filteredItems.slice(start, start + pageSize);
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconTruck class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Master Data Supplier
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola basis data vendor dan mitra pemasok bahan baku cetak, tinta solvent/DTF, suku cadang
				mesin, dan perlengkapan.
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
					placeholder="Cari nama supplier, no. telepon, email, alamat..."
					value={supplierStore.searchQuery}
					onValueChange={(val) => {
						supplierStore.searchQuery = val;
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
					onclick={() => supplierStore.load()}
					disabled={supplierStore.isLoading}
					aria-label="Segarkan data"
					title="Segarkan data"
					class="size-8 justify-center! p-0!"
				>
					<IconRefreshCw
						class="size-4 text-foreground-subtle transition-transform {supplierStore.isLoading
							? 'animate-spin'
							: ''}"
					/>
				</Button>

				<Button variant="default" size="sm" onclick={openCreateModal} class="shrink-0 gap-1.5">
					<IconCirclePlus class="size-4" />
					<span>Tambah Supplier</span>
				</Button>
			</div>
		</div>

		<!-- Table Container -->
		<Card class="overflow-hidden shadow-none">
			{#if supplierStore.isLoading && supplierStore.items.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Spinner class="size-8 text-primary" />
					<span class="mt-3 text-xs text-foreground-subtle">Memuat data supplier...</span>
				</div>
			{:else if supplierStore.error}
				<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
					<IconAlertCircle class="size-8" />
					<span class="mt-2 text-sm font-semibold">Gagal memuat data</span>
					<span class="mt-1 text-xs text-foreground-subtle">{supplierStore.error}</span>
					<Button variant="outline" size="sm" class="mt-4" onclick={() => supplierStore.load()}>
						Coba Lagi
					</Button>
				</div>
			{:else if supplierStore.filteredItems.length === 0}
				<div class="py-12">
					<EmptyState>
						{#snippet icon()}
							<div
								class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<IconTruck class="size-6" />
							</div>
						{/snippet}
						{#snippet title()}
							<Typography variant="h4" as="span" class="font-semibold text-foreground">
								{supplierStore.searchQuery ? 'Supplier Tidak Ditemukan' : 'Belum Ada Data Supplier'}
							</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
								{supplierStore.searchQuery
									? 'Tidak ada supplier yang cocok dengan kata kunci pencarian.'
									: 'Mulai daftarkan mitra vendor dan pemasok percetakan Anda.'}
							</Typography>
						{/snippet}
						{#if !supplierStore.searchQuery}
							<Button variant="default" size="sm" onclick={openCreateModal} class="mt-2 gap-1.5">
								<IconCirclePlus class="size-4" />
								<span>Tambah Supplier Sekarang</span>
							</Button>
						{:else}
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									supplierStore.searchQuery = '';
									currentPage = 1;
								}}
								class="mt-2"
							>
								Reset Pencarian
							</Button>
						{/if}
					</EmptyState>
				</div>
			{:else}
				<Table class="rounded-none border-0 bg-transparent">
					<TableHeader>
						<TableRow class="border-b-0 hover:bg-transparent">
							<TableHead class="min-w-60">Nama</TableHead>
							<TableHead class="w-40">No. Telp</TableHead>
							<TableHead class="min-w-44">Email</TableHead>
							<TableHead class="min-w-56">Alamat</TableHead>
							<TableHead class="w-20 text-center">Index</TableHead>
							<TableHead class="w-14 text-right"><span class="sr-only">Aksi</span></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedItems as item (item.id)}
							<TableRow
								class="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/40"
							>
								<!-- 1. Nama Supplier -->
								<TableCell>
									<div class="flex items-center gap-3">
										<Avatar
											alt={item.name}
											class="size-9.5 shrink-0 rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-2xs"
											classes={{ fallback: 'text-sm font-bold text-primary' }}
										>
											{getSupplierInitial(item.name)}
										</Avatar>
										<div class="flex flex-col">
											<span class="leading-snug font-medium text-foreground">{item.name}</span>
											{#if item.contactPerson}
												<div
													class="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-subtle"
												>
													<IconUser class="size-3 shrink-0" />
													<span>PIC: {item.contactPerson}</span>
												</div>
											{/if}
										</div>
									</div>
								</TableCell>

								<!-- 2. No. Telp -->
								<TableCell>
									{#if item.phone && item.phone !== '-'}
										<div class="flex items-center gap-1.5 text-xs text-foreground">
											<IconPhone class="size-3.5 shrink-0 text-foreground-subtle" />
											<span>{item.phone}</span>
										</div>
									{:else}
										<span class="text-xs text-foreground-subtle">-</span>
									{/if}
								</TableCell>

								<!-- 3. Email -->
								<TableCell>
									{#if item.email}
										<div class="flex items-center gap-1.5 text-xs text-foreground">
											<IconMail class="size-3.5 shrink-0 text-foreground-subtle" />
											<span class="max-w-48 truncate" title={item.email}>{item.email}</span>
										</div>
									{:else}
										<span class="text-xs text-foreground-subtle">-</span>
									{/if}
								</TableCell>

								<!-- 4. Alamat -->
								<TableCell>
									<span
										class="line-clamp-2 text-xs text-foreground-subtle"
										title={item.address || ''}
									>
										{item.address || '-'}
									</span>
								</TableCell>

								<!-- 5. Index (Urutan Display) -->
								<TableCell class="text-center">
									<button
										type="button"
										onclick={() => openOrderModal(item)}
										class="group inline-flex size-6 cursor-pointer items-center justify-center rounded border border-border/70 bg-surface-subtle text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
										title="Ubah nomor urut"
									>
										{item.displayOrder}
									</button>
								</TableCell>

								<!-- 6. Aksi (Vertical Ellipsis Dropdown Popover) -->
								<TableCell class="text-right">
									{@const sorted = [...supplierStore.items].sort(
										(a, b) => a.displayOrder - b.displayOrder
									)}
									{@const fullIdx = sorted.findIndex((i) => i.id === item.id)}
									{@const isFirst = fullIdx === 0}
									{@const isLast = fullIdx === sorted.length - 1}

									<Dropdown
										placement="bottom-end"
										offset={4}
										aria-label="Aksi Supplier"
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

		{#if !supplierStore.isLoading && !supplierStore.error && supplierStore.filteredItems.length > 0}
			<!-- Pagination & Table Controls -->
			<TablePagination
				bind:currentPage
				bind:pageSize
				totalItems={supplierStore.filteredItems.length}
				pageSizeOptions={[5, 10, 20]}
				itemLabel="supplier"
			/>
		{/if}
	</div>
</div>

<!-- Modal Form Dialog -->
<SupplierFormDialog
	bind:open={isFormOpen}
	supplier={selectedSupplierForEdit}
	onSave={handleSave}
	onClose={() => {
		isFormOpen = false;
		selectedSupplierForEdit = null;
	}}
/>

<!-- Delete Confirmation Dialog -->
<SupplierDeleteDialog
	bind:open={isDeleteOpen}
	supplier={selectedSupplierForDelete}
	onConfirm={handleDelete}
	onClose={() => {
		isDeleteOpen = false;
		selectedSupplierForDelete = null;
	}}
/>

<!-- Modal Change Display Order -->
<SupplierOrderDialog
	bind:open={isOrderOpen}
	supplier={selectedSupplierForOrder}
	maxOrder={supplierStore.items.length}
	onSave={handleOrderSave}
	onClose={() => {
		isOrderOpen = false;
		selectedSupplierForOrder = null;
	}}
/>
