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
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconHandshake from '~icons/lucide/handshake';
	import IconPhone from '~icons/lucide/phone';
	import {
		type Reseller,
		type ResellerInput,
		formatCurrency,
		getResellerInitial
	} from '../../domain/reseller.entity';
	import { resellerStore } from '../../application/reseller.store.svelte';
	import ResellerFormDialog from '../components/ResellerFormDialog.svelte';
	import ResellerDeleteDialog from '../components/ResellerDeleteDialog.svelte';
	import ResellerCreditLimitDialog from '../components/ResellerCreditLimitDialog.svelte';

	onMount(() => {
		resellerStore.load();
	});

	let isFormOpen = $state(false);
	let selectedResellerForEdit = $state<Reseller | null>(null);

	let isDeleteOpen = $state(false);
	let selectedResellerForDelete = $state<Reseller | null>(null);

	let isCreditLimitOpen = $state(false);
	let selectedResellerForCreditLimit = $state<Reseller | null>(null);

	let currentPage = $state(1);
	let pageSize = $state(10);

	function openCreateModal() {
		selectedResellerForEdit = null;
		isFormOpen = true;
	}

	function openEditModal(reseller: Reseller) {
		selectedResellerForEdit = reseller;
		isFormOpen = true;
	}

	function openDeleteModal(reseller: Reseller) {
		selectedResellerForDelete = reseller;
		isDeleteOpen = true;
	}

	function openCreditLimitModal(reseller: Reseller) {
		selectedResellerForCreditLimit = reseller;
		isCreditLimitOpen = true;
	}

	async function handleSave(input: ResellerInput): Promise<boolean> {
		if (selectedResellerForEdit) {
			const success = await resellerStore.update(selectedResellerForEdit.id, input);
			if (success) {
				toast.success('Data reseller berhasil diperbarui', {
					description: `Data reseller "${input.ownerName}" telah disimpan.`
				});
			} else {
				toast.danger('Gagal memperbarui data', {
					description: resellerStore.error || 'Terjadi kesalahan sistem saat memperbarui data.'
				});
			}
			return success;
		}

		const success = await resellerStore.create(input);
		if (success) {
			toast.success('Reseller berhasil didaftarkan', {
				description: `Reseller "${input.ownerName}" berhasil ditambahkan.`
			});
		} else {
			toast.danger('Gagal mendaftarkan reseller', {
				description: resellerStore.error || 'Terjadi kesalahan sistem saat mendaftarkan data.'
			});
		}
		return success;
	}

	async function handleDelete(): Promise<boolean> {
		if (!selectedResellerForDelete) return false;
		const name = selectedResellerForDelete.ownerName;
		const success = await resellerStore.delete(selectedResellerForDelete.id);
		if (success) {
			toast.success('Data reseller berhasil dihapus', {
				description: `Reseller "${name}" telah dihapus dari sistem.`
			});
		} else {
			toast.danger('Gagal menghapus reseller', {
				description: resellerStore.error || 'Terjadi kesalahan sistem saat menghapus data.'
			});
		}
		return success;
	}

	async function handleCreditLimitSave(newLimit: number): Promise<boolean> {
		if (!selectedResellerForCreditLimit) return false;
		const name = selectedResellerForCreditLimit.ownerName;
		const success = await resellerStore.update(selectedResellerForCreditLimit.id, {
			...selectedResellerForCreditLimit,
			creditLimit: newLimit,
			status:
				newLimit < selectedResellerForCreditLimit.usedCredit
					? 'auto_hold'
					: selectedResellerForCreditLimit.status === 'auto_hold' &&
						  selectedResellerForCreditLimit.usedCredit <= newLimit
						? 'active'
						: selectedResellerForCreditLimit.status
		});
		if (success) {
			toast.success('Limit kredit berhasil diperbarui', {
				description: `Limit kredit untuk "${name}" disesuaikan menjadi ${formatCurrency(newLimit)}.`
			});
		} else {
			toast.danger('Gagal mengubah limit kredit', {
				description: resellerStore.error || 'Terjadi kesalahan sistem saat memperbarui data.'
			});
		}
		return success;
	}

	const paginatedItems = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return resellerStore.filteredItems.slice(start, start + pageSize);
	});
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconHandshake class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Master Data Biro & Reseller
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Kelola daftar reseller, limit plafon kredit, sisa piutang berjalan, dan kontak.
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
					placeholder="Cari nama reseller, no. telepon, alamat..."
					value={resellerStore.searchQuery}
					onValueChange={(val) => {
						resellerStore.searchQuery = val;
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
					onclick={() => resellerStore.load()}
					disabled={resellerStore.isLoading}
					aria-label="Segarkan data"
					title="Segarkan data"
					class="size-8 justify-center! p-0!"
				>
					<IconRefreshCw
						class="size-4 text-foreground-subtle transition-transform {resellerStore.isLoading
							? 'animate-spin'
							: ''}"
					/>
				</Button>

				<Button variant="default" size="sm" onclick={openCreateModal} class="shrink-0 gap-1.5">
					<IconCirclePlus class="size-4" />
					<span>Daftarkan Reseller</span>
				</Button>
			</div>
		</div>

		<!-- Table Container -->
		<Card class="overflow-hidden shadow-none">
			{#if resellerStore.isLoading && resellerStore.items.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Spinner class="size-8 text-primary" />
					<span class="mt-3 text-xs text-foreground-subtle">Memuat data reseller...</span>
				</div>
			{:else if resellerStore.error}
				<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
					<IconAlertCircle class="size-8" />
					<span class="mt-2 text-sm font-semibold">Gagal memuat data</span>
					<span class="mt-1 text-xs text-foreground-subtle">{resellerStore.error}</span>
					<Button variant="outline" size="sm" class="mt-4" onclick={() => resellerStore.load()}>
						Coba Lagi
					</Button>
				</div>
			{:else if resellerStore.filteredItems.length === 0}
				<div class="py-12">
					<EmptyState>
						{#snippet icon()}
							<div
								class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<IconHandshake class="size-6" />
							</div>
						{/snippet}
						{#snippet title()}
							<Typography variant="h4" as="span" class="font-semibold text-foreground">
								{resellerStore.searchQuery
									? 'Reseller Tidak Ditemukan'
									: 'Belum Ada Data Reseller'}
							</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
								{resellerStore.searchQuery
									? 'Tidak ada reseller yang cocok dengan kata kunci pencarian.'
									: 'Mulai daftarkan rekanan reseller baru Anda.'}
							</Typography>
						{/snippet}
						{#if !resellerStore.searchQuery}
							<Button variant="default" size="sm" onclick={openCreateModal} class="mt-2 gap-1.5">
								<IconCirclePlus class="size-4" />
								<span>Daftarkan Reseller Sekarang</span>
							</Button>
						{:else}
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									resellerStore.searchQuery = '';
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
							<TableHead class="min-w-52">Alamat</TableHead>
							<TableHead class="w-40 text-right">Limit Kredit</TableHead>
							<TableHead class="w-36 text-right">Sisa Piutang</TableHead>
							<TableHead class="w-14 text-right"><span class="sr-only">Aksi</span></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedItems as item (item.id)}
							<TableRow
								class="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/40"
							>
								<!-- 1. Nama Reseller -->
								<TableCell>
									<div class="flex items-center gap-3">
										<Avatar
											alt={item.ownerName}
											class="size-9.5 shrink-0 rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-2xs"
											classes={{ fallback: 'text-sm font-bold text-primary' }}
										>
											{getResellerInitial(item.ownerName)}
										</Avatar>
										<span class="leading-snug font-medium text-foreground">{item.ownerName}</span>
									</div>
								</TableCell>

								<!-- 2. No. Telp -->
								<TableCell>
									<div class="flex items-center gap-1.5 text-xs text-foreground">
										<IconPhone class="size-3.5 shrink-0 text-foreground-subtle" />
										<span>{item.phone}</span>
									</div>
								</TableCell>

								<!-- 3. Alamat -->
								<TableCell>
									<span class="line-clamp-2 text-xs text-foreground-subtle">
										{item.address || '-'}
									</span>
								</TableCell>

								<!-- 4. Limit Kredit (Klik untuk mengubah) -->
								<TableCell class="text-right">
									<button
										type="button"
										onclick={() => openCreditLimitModal(item)}
										class="group inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-surface-subtle hover:text-primary"
										title="Klik untuk mengubah limit kredit"
									>
										<span>{formatCurrency(item.creditLimit)}</span>
										<IconEdit2 class="size-3 text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary" />
									</button>
								</TableCell>

								<!-- 5. Sisa Piutang -->
								<TableCell class="text-right">
									<span
										class="text-xs font-semibold {item.usedCredit > item.creditLimit
											? 'text-rose-600 dark:text-rose-400'
											: item.usedCredit > 0
												? 'text-amber-600 dark:text-amber-400'
												: 'text-foreground-subtle'}"
									>
										{formatCurrency(item.usedCredit)}
									</span>
								</TableCell>

								<!-- 6. Aksi (Dropdown) -->
								<TableCell class="text-right">
									<Dropdown
										placement="bottom-end"
										offset={4}
										aria-label="Aksi Reseller"
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
											<span>Edit Profil</span>
										</DropdownItem>
										<DropdownItem
											class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
											onSelect={() => openDeleteModal(item)}
										>
											<IconTrash2 class="size-3.5 text-danger" />
											<span>Hapus Mitra</span>
										</DropdownItem>
									</Dropdown>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</Card>

		{#if !resellerStore.isLoading && !resellerStore.error && resellerStore.filteredItems.length > 0}
			<!-- Pagination & Table Controls -->
			<TablePagination
				bind:currentPage
				bind:pageSize
				totalItems={resellerStore.filteredItems.length}
				pageSizeOptions={[5, 10, 20]}
				itemLabel="reseller"
			/>
		{/if}
	</div>
</div>

<!-- Modal Form Dialog -->
<ResellerFormDialog
	bind:open={isFormOpen}
	reseller={selectedResellerForEdit}
	onSave={handleSave}
	onClose={() => {
		isFormOpen = false;
		selectedResellerForEdit = null;
	}}
/>

<!-- Delete Confirmation Dialog -->
<ResellerDeleteDialog
	bind:open={isDeleteOpen}
	reseller={selectedResellerForDelete}
	onConfirm={handleDelete}
	onClose={() => {
		isDeleteOpen = false;
		selectedResellerForDelete = null;
	}}
/>

<!-- Credit Limit Dialog -->
<ResellerCreditLimitDialog
	bind:open={isCreditLimitOpen}
	reseller={selectedResellerForCreditLimit}
	onSave={handleCreditLimitSave}
	onClose={() => {
		isCreditLimitOpen = false;
		selectedResellerForCreditLimit = null;
	}}
/>
