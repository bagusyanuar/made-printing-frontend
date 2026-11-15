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
	import IconSlidersHorizontal from '~icons/lucide/sliders-horizontal';
	import IconLayers from '~icons/lucide/layers';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconList from '~icons/lucide/list';
	import {
		type ProductAttribute,
		type ProductAttributeInput
	} from '../../domain/attribute-variant.entity';
	import { attributeVariantStore } from '../../application/attribute-variant.store.svelte';
	import AttributeFormDialog from '../components/AttributeFormDialog.svelte';
	import AttributeDeleteDialog from '../components/AttributeDeleteDialog.svelte';
	import AttributeVariantListDialog from '../components/AttributeVariantListDialog.svelte';

	onMount(() => {
		attributeVariantStore.load();
	});

	let isFormOpen = $state(false);
	let selectedAttributeForEdit = $state<ProductAttribute | null>(null);

	let isDeleteOpen = $state(false);
	let selectedAttributeForDelete = $state<ProductAttribute | null>(null);

	let isVariantListOpen = $state(false);
	let selectedAttributeForList = $state<ProductAttribute | null>(null);

	let currentPage = $state(1);
	let pageSize = $state(10);

	function openCreateModal() {
		selectedAttributeForEdit = null;
		isFormOpen = true;
	}

	function openEditModal(attr: ProductAttribute) {
		selectedAttributeForEdit = attr;
		isFormOpen = true;
	}

	function openDeleteModal(attr: ProductAttribute) {
		selectedAttributeForDelete = attr;
		isDeleteOpen = true;
	}

	function openVariantListModal(attr: ProductAttribute) {
		selectedAttributeForList = attr;
		isVariantListOpen = true;
	}

	async function handleSave(input: ProductAttributeInput): Promise<boolean> {
		if (selectedAttributeForEdit) {
			const success = await attributeVariantStore.updateAttribute(
				selectedAttributeForEdit.id,
				input
			);
			if (success) {
				toast.success('Atribut berhasil diperbarui', {
					description: `Atribut "${input.name}" telah disimpan.`
				});
			} else {
				toast.danger('Gagal memperbarui atribut', {
					description: attributeVariantStore.error || 'Terjadi kesalahan sistem.'
				});
			}
			return success;
		}

		const success = await attributeVariantStore.createAttribute(input);
		if (success) {
			toast.success('Atribut berhasil dibuat', {
				description: `Atribut "${input.name}" berhasil ditambahkan.`
			});
		} else {
			toast.danger('Gagal membuat atribut', {
				description:
					attributeVariantStore.error || 'Terjadi kesalahan sistem saat membuat atribut.'
			});
		}
		return success;
	}

	async function handleDelete(): Promise<boolean> {
		if (!selectedAttributeForDelete) return false;
		const name = selectedAttributeForDelete.name;
		const success = await attributeVariantStore.deleteAttribute(selectedAttributeForDelete.id);
		if (success) {
			toast.success('Atribut berhasil dihapus', {
				description: `Atribut "${name}" telah dihapus.`
			});
		} else {
			toast.danger('Gagal menghapus atribut', {
				description: attributeVariantStore.error || 'Terjadi kesalahan sistem.'
			});
		}
		return success;
	}

	function getAttributeInitial(name: string): string {
		const trimmed = name.trim();
		if (!trimmed) return '?';
		return trimmed.charAt(0).toUpperCase();
	}

	const paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return attributeVariantStore.filteredItems.slice(start, start + pageSize);
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconSlidersHorizontal class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Master Data Atribut & Varian
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola nama atribut spesifikasi produk cetak (sisi cetak, laminasi, dll) beserta daftar pilihan nilainya.
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
					placeholder="Cari atribut atau pilihan nilai..."
					value={attributeVariantStore.searchQuery}
					onValueChange={(val) => {
						attributeVariantStore.searchQuery = val;
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
					onclick={() => attributeVariantStore.load()}
					disabled={attributeVariantStore.isLoading}
					aria-label="Segarkan data"
					title="Segarkan data"
					class="size-8 justify-center! p-0!"
				>
					<IconRefreshCw
						class="size-4 text-foreground-subtle transition-transform {attributeVariantStore.isLoading
							? 'animate-spin'
							: ''}"
					/>
				</Button>

				<Button variant="default" size="sm" onclick={openCreateModal} class="shrink-0 gap-1.5">
					<IconCirclePlus class="size-4" />
					<span>Tambah Atribut</span>
				</Button>
			</div>
		</div>

		<!-- Table Container -->
		<Card class="overflow-hidden shadow-none">
			{#if attributeVariantStore.isLoading && attributeVariantStore.items.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Spinner class="size-8 text-primary" />
					<span class="mt-3 text-xs text-foreground-subtle">Memuat data atribut & varian...</span>
				</div>
			{:else if attributeVariantStore.error}
				<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
					<IconAlertCircle class="size-8" />
					<span class="mt-2 text-sm font-semibold">Gagal memuat data</span>
					<span class="mt-1 text-xs text-foreground-subtle">{attributeVariantStore.error}</span>
					<Button
						variant="outline"
						size="sm"
						class="mt-4"
						onclick={() => attributeVariantStore.load()}
					>
						Coba Lagi
					</Button>
				</div>
			{:else if attributeVariantStore.filteredItems.length === 0}
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
								{attributeVariantStore.searchQuery
									? 'Tidak ada atribut yang cocok'
									: 'Belum ada data atribut'}
							</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
								{attributeVariantStore.searchQuery
									? `Tidak ditemukan atribut dengan kata kunci "${attributeVariantStore.searchQuery}".`
									: 'Mulai dengan menambahkan atribut spesifikasi produk baru.'}
							</Typography>
						{/snippet}
						{#if !attributeVariantStore.searchQuery}
							<Button variant="default" size="sm" onclick={openCreateModal} class="mt-2 gap-1.5">
								<IconCirclePlus class="size-4" />
								<span>Tambah Atribut</span>
							</Button>
						{/if}
					</EmptyState>
				</div>
			{:else}
				<Table class="rounded-none border-0 bg-transparent">
					<TableHeader>
						<TableRow class="border-b-0 hover:bg-transparent">
							<TableHead class="min-w-56">Nama Atribut</TableHead>
							<TableHead>Varian</TableHead>
							<TableHead class="w-16 text-right"><span class="sr-only">Aksi</span></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedItems as item (item.id)}
							<TableRow
								class="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/40"
							>
								<!-- 1. Nama Atribut -->
								<TableCell>
									<div class="flex items-center gap-3">
										<Avatar
											alt={item.name}
											class="size-9.5 shrink-0 rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-2xs"
											classes={{ fallback: 'text-sm font-bold text-primary' }}
										>
											{getAttributeInitial(item.name)}
										</Avatar>
										<div class="flex min-w-0 flex-col">
											<div class="leading-snug font-medium text-foreground">{item.name}</div>
											<div class="mt-0.5 text-xs text-foreground-subtle">
												{item.code}
											</div>
										</div>
									</div>
								</TableCell>

								<!-- 2. Varian -->
								<TableCell>
									{#if item.variants.length > 0}
										{@const sortedVars = [...item.variants].sort(
											(a, b) => a.displayOrder - b.displayOrder
										)}
										<div class="flex flex-wrap items-center gap-1.5">
											{#each sortedVars.slice(0, 4) as v (v.id)}
												<Badge variant="secondary" size="sm" class="rounded-md text-xs font-normal">
													{v.name}
												</Badge>
											{/each}
											{#if sortedVars.length > 4}
												<button
													type="button"
													onclick={() => openVariantListModal(item)}
													class="inline-flex cursor-pointer select-none items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
													title={`Klik untuk melihat semua ${sortedVars.length} varian`}
												>
													+{sortedVars.length - 4} lainnya
												</button>
											{/if}
										</div>
									{:else}
										<span class="text-xs italic text-foreground-subtle">
											Input teks bebas (tanpa opsi)
										</span>
									{/if}
								</TableCell>

								<!-- 3. Aksi -->
								<TableCell class="text-right">
									<Dropdown
										placement="bottom-end"
										offset={4}
										aria-label="Aksi Atribut"
										class="size-8 justify-center! rounded-lg border border-transparent p-0! text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
										classes={{
											trigger: 'size-8 justify-center! p-0!',
											content: 'min-w-40 border-border bg-surface p-1 shadow-none'
										}}
									>
										{#snippet trigger()}
											<IconEllipsisVertical class="size-4" />
										{/snippet}
										{#if item.variants.length > 0}
											<DropdownItem
												class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
												onSelect={() => openVariantListModal(item)}
											>
												<IconList class="size-3.5 text-foreground-subtle" />
												<span>Lihat Semua Varian ({item.variants.length})</span>
											</DropdownItem>
										{/if}
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

		{#if !attributeVariantStore.isLoading && !attributeVariantStore.error && attributeVariantStore.filteredItems.length > 0}
			<!-- Pagination & Table Controls -->
			<TablePagination
				bind:currentPage
				bind:pageSize
				totalItems={attributeVariantStore.filteredItems.length}
				pageSizeOptions={[5, 10, 20]}
				itemLabel="atribut"
			/>
		{/if}
	</div>
</div>

<!-- Modal Form Create / Edit -->
<AttributeFormDialog
	bind:open={isFormOpen}
	attribute={selectedAttributeForEdit}
	onSave={handleSave}
	onClose={() => (isFormOpen = false)}
/>

<!-- Modal Delete Confirmation -->
<AttributeDeleteDialog
	bind:open={isDeleteOpen}
	attribute={selectedAttributeForDelete}
	onConfirm={handleDelete}
	onClose={() => (isDeleteOpen = false)}
/>

<!-- Modal View All Variants -->
<AttributeVariantListDialog
	bind:open={isVariantListOpen}
	attribute={selectedAttributeForList}
	onClose={() => (isVariantListOpen = false)}
	onEdit={(attr) => openEditModal(attr)}
/>
