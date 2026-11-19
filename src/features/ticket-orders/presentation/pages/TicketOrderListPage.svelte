<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
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

	import IconTicket from '~icons/lucide/ticket';
	import IconCirclePlus from '~icons/lucide/circle-plus';
	import IconSearch from '~icons/lucide/search';
	import IconRefreshCw from '~icons/lucide/refresh-cw';
	import IconEye from '~icons/lucide/eye';
	import IconSend from '~icons/lucide/send';
	import IconBan from '~icons/lucide/ban';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import IconCalendar from '~icons/lucide/calendar';
	import IconUser from '~icons/lucide/user';

	import type { TicketOrder } from '../../domain/ticket-order.entity';
	import { ticketOrderStore } from '../../application/ticket-order.store.svelte';
	import TicketOrderDetailDialog from '../components/TicketOrderDetailDialog.svelte';
	import TicketOrderCancelDialog from '../components/TicketOrderCancelDialog.svelte';

	onMount(() => {
		ticketOrderStore.statusTab = 'pending';
		ticketOrderStore.load();
	});

	let isDetailOpen = $state(false);
	let selectedTicketForDetail = $state<TicketOrder | null>(null);

	let isCancelOpen = $state(false);
	let selectedTicketForCancel = $state<TicketOrder | null>(null);

	function openDetailModal(ticket: TicketOrder) {
		selectedTicketForDetail = ticket;
		isDetailOpen = true;
	}

	function openCancelModal(ticket: TicketOrder) {
		selectedTicketForCancel = ticket;
		isCancelOpen = true;
	}

	async function handleSubmitToCashier(id: string): Promise<boolean> {
		const success = await ticketOrderStore.submitToCashier(id);
		if (success) {
			toast.success('Tiket terkirim ke kasir', {
				description: 'Status diperbarui menjadi Dikirim ke Kasir (Menunggu Pembayaran/Nota).'
			});
			ticketOrderStore.load();
		} else {
			toast.danger('Gagal mengirim ke kasir', {
				description: ticketOrderStore.error || 'Terjadi kesalahan sistem saat mengirim tiket.'
			});
		}
		return success;
	}

	async function handleCancelTicket(reason: string): Promise<boolean> {
		if (!selectedTicketForCancel) return false;
		const jobNumber = selectedTicketForCancel.jobNumber;
		const success = await ticketOrderStore.cancel(selectedTicketForCancel.id, reason);
		if (success) {
			toast.success('Tiket pesanan dibatalkan', {
				description: `Tiket "${jobNumber}" berhasil dibatalkan.`
			});
			ticketOrderStore.load();
		} else {
			toast.danger('Gagal membatalkan tiket', {
				description: ticketOrderStore.error || 'Terjadi kesalahan sistem saat membatalkan tiket.'
			});
		}
		return success;
	}

	function formatDateTime(isoString?: string | null): string {
		if (!isoString) return '-';
		const d = new Date(isoString);
		if (isNaN(d.getTime())) return isoString;
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		const hours = String(d.getHours()).padStart(2, '0');
		const minutes = String(d.getMinutes()).padStart(2, '0');
		const seconds = String(d.getSeconds()).padStart(2, '0');
		return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex items-start gap-3.5 sm:gap-4">
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs"
		>
			<IconTicket class="size-6" />
		</div>
		<div class="flex flex-col">
			<Typography variant="h2" as="h1" class="font-bold tracking-tight text-foreground">
				Tiket Pesanan
			</Typography>
			<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle sm:text-sm">
				Antrean tiket kerja teknis desainer dan spesifikasi cetak yang belum dikirim ke kasir.
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
					placeholder="Cari nomor tiket, nama pelanggan, memo..."
					value={ticketOrderStore.searchQuery}
					onValueChange={(val) => {
						ticketOrderStore.searchQuery = val;
						ticketOrderStore.page = 1;
						ticketOrderStore.load();
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
					onclick={() => ticketOrderStore.load()}
					disabled={ticketOrderStore.isLoading}
					aria-label="Segarkan data"
					title="Segarkan data"
					class="size-8 justify-center! p-0!"
				>
					<IconRefreshCw
						class="size-4 text-foreground-subtle transition-transform {ticketOrderStore.isLoading
							? 'animate-spin'
							: ''}"
					/>
				</Button>

				<Button variant="default" size="sm" class="shrink-0 gap-1.5">
					{#snippet child({ props })}
						<a {...props} href={resolve('/(app)/tickets/new')}>
							<IconCirclePlus class="size-4" />
							<span>Buat Tiket Baru</span>
						</a>
					{/snippet}
				</Button>
			</div>
		</div>

		<!-- Table or State Container -->
		<Card class="overflow-hidden shadow-none">
			{#if ticketOrderStore.isLoading && ticketOrderStore.items.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Spinner class="size-8 text-primary" />
					<span class="mt-3 text-xs text-foreground-subtle">Memuat daftar tiket pesanan...</span>
				</div>
			{:else if ticketOrderStore.error}
				<div class="flex flex-col items-center justify-center py-12 text-center text-danger">
					<IconAlertCircle class="size-8" />
					<span class="mt-2 text-sm font-semibold">Gagal memuat data</span>
					<span class="mt-1 text-xs text-foreground-subtle">{ticketOrderStore.error}</span>
					<Button variant="outline" size="sm" class="mt-4" onclick={() => ticketOrderStore.load()}>
						Coba Lagi
					</Button>
				</div>
			{:else if ticketOrderStore.items.length === 0}
				<div class="py-12">
					<EmptyState>
						{#snippet icon()}
							<div
								class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<IconTicket class="size-6" />
							</div>
						{/snippet}
						{#snippet title()}
							<Typography variant="h4" as="span" class="font-semibold text-foreground">
								{ticketOrderStore.searchQuery
									? 'Tiket Pesanan Tidak Ditemukan'
									: 'Tidak Ada Antrean Tiket'}
							</Typography>
						{/snippet}
						{#snippet description()}
							<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
								{ticketOrderStore.searchQuery
									? 'Tidak ada tiket yang cocok dengan kata kunci pencarian Anda.'
									: 'Semua tiket telah diteruskan ke kasir atau belum ada tiket baru.'}
							</Typography>
						{/snippet}
						{#if !ticketOrderStore.searchQuery}
							<Button variant="default" size="sm" class="mt-2 gap-1.5">
								{#snippet child({ props })}
									<a {...props} href={resolve('/(app)/tickets/new')}>
										<IconCirclePlus class="size-4" />
										<span>Buat Tiket Baru</span>
									</a>
								{/snippet}
							</Button>
						{:else}
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									ticketOrderStore.searchQuery = '';
									ticketOrderStore.page = 1;
									ticketOrderStore.load();
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
							<TableHead class="min-w-40">No. Tiket</TableHead>
							<TableHead class="min-w-44">Tanggal Buat</TableHead>
							<TableHead class="min-w-48">Pelanggan</TableHead>
							<TableHead class="min-w-60">Daftar Cetakan (Multi-Product)</TableHead>
							<TableHead class="w-28 text-center">Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each ticketOrderStore.items as ticket (ticket.id)}
							<TableRow
								class="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-subtle/40"
							>
								<!-- 1. No. Tiket / Transaksi -->
								<TableCell>
									<span
										class="inline-flex items-center rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-semibold tracking-wider text-foreground shadow-2xs"
									>
										{ticket.jobNumber}
									</span>
								</TableCell>

								<!-- 2. Tanggal Buat -->
								<TableCell>
									<div class="flex items-center gap-2 text-xs font-medium text-foreground">
										<IconCalendar class="size-4 shrink-0 text-foreground-subtle" />
										<span>{formatDateTime(ticket.createdAt)}</span>
									</div>
								</TableCell>

								<!-- 3. Pelanggan -->
								<TableCell>
									<div class="flex flex-col gap-0.5">
										<div class="flex items-center gap-1.5 font-bold text-foreground">
											<IconUser
												class="size-4 shrink-0 {ticket.customerType === 'reseller'
													? 'text-blue-500'
													: 'text-rose-500'}"
											/>
											<span class="font-semibold text-foreground">{ticket.customerName}</span>
											{#if ticket.customerType === 'reseller'}
												<span
													class="inline-flex items-center rounded border border-blue-500/40 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-500 uppercase"
												>
													RESELLER
												</span>
											{:else}
												<span
													class="inline-flex items-center rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-rose-500 uppercase"
												>
													RETAIL
												</span>
											{/if}
										</div>
										<div class="pl-5.5 text-xs text-foreground-subtle">
											{ticket.customerPhone || '-'}
										</div>
									</div>
								</TableCell>

								<!-- 4. Daftar Cetakan (Multi-Product) -->
								<TableCell>
									<div class="flex flex-col gap-1">
										<span class="text-xs font-semibold text-rose-500">
											{ticket.items.length} Item Cetakan:
										</span>
										{#if ticket.items.length > 0}
											<div class="flex flex-col gap-0.5 text-xs">
												{#each ticket.items.slice(0, 2) as item (item.id)}
													<div class="leading-snug text-foreground-subtle">
														<span class="font-medium text-foreground">{item.productName}</span>
														{#if item.variantName && item.variantName.toLowerCase() !== 'default'}
															<span>({item.variantName})</span>
														{/if}
														<span class="font-medium text-foreground">({item.quantity}x)</span>
													</div>
												{/each}
												{#if ticket.items.length > 2}
													<button
														type="button"
														onclick={() => openDetailModal(ticket)}
														class="inline-flex w-fit cursor-pointer items-center text-[11px] font-medium text-primary hover:underline"
														title="Klik untuk melihat semua rincian item"
													>
														+{ticket.items.length - 2} item lainnya...
													</button>
												{/if}
											</div>
										{:else}
											<span class="text-xs text-foreground-faint">-</span>
										{/if}
									</div>
								</TableCell>

								<!-- 5. Aksi -->
								<TableCell class="text-center">
									<div class="flex items-center justify-center gap-1.5">
										{#if ticket.status === 'DRAFT'}
											<button
												type="button"
												onclick={() => handleSubmitToCashier(ticket.id)}
												disabled={ticketOrderStore.isLoading}
												class="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs transition-colors hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
												title="Kirim ke Kasir"
												aria-label="Kirim ke Kasir"
											>
												<IconSend class="size-4" />
											</button>
										{/if}

										<Dropdown
											placement="bottom-end"
											offset={4}
											aria-label="Aksi Tiket Pesanan"
											class="size-8 justify-center! rounded-lg border border-transparent p-0! text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
											classes={{
												trigger: 'size-8 justify-center! p-0!',
												content: 'min-w-44 border-border bg-surface p-1 shadow-none'
											}}
										>
											{#snippet trigger()}
												<IconEllipsisVertical class="size-4" />
											{/snippet}

											<DropdownItem
												class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
												onSelect={() => openDetailModal(ticket)}
											>
												<IconEye class="size-3.5 text-foreground-subtle" />
												<span>Lihat Detail Spesifikasi</span>
											</DropdownItem>

											{#if ticket.status === 'DRAFT'}
												<DropdownItem
													class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle"
													onSelect={() => handleSubmitToCashier(ticket.id)}
												>
													<IconSend class="size-3.5 text-primary" />
													<span>Kirim ke Kasir</span>
												</DropdownItem>
											{/if}

											{#if ticket.status !== 'CANCELLED' && ticket.status !== 'COMPLETED'}
												<DropdownItem
													class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
													onSelect={() => openCancelModal(ticket)}
												>
													<IconBan class="size-3.5 text-danger" />
													<span>Batalkan Tiket</span>
												</DropdownItem>
											{/if}
										</Dropdown>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</Card>

		{#if !ticketOrderStore.isLoading && !ticketOrderStore.error && ticketOrderStore.items.length > 0}
			<!-- Pagination & Table Controls -->
			<TablePagination
				bind:currentPage={ticketOrderStore.page}
				bind:pageSize={ticketOrderStore.limit}
				totalItems={ticketOrderStore.totalData}
				pageSizeOptions={[5, 10, 20, 50]}
				itemLabel="data"
				rowsPerPageLabel="Baris per halaman"
				onPageChange={(p) => {
					ticketOrderStore.page = p;
					ticketOrderStore.load();
				}}
				onPageSizeChange={(s) => {
					ticketOrderStore.limit = s;
					ticketOrderStore.page = 1;
					ticketOrderStore.load();
				}}
			/>
		{/if}
	</div>
</div>

<!-- Dialogs -->
<TicketOrderDetailDialog
	bind:isOpen={isDetailOpen}
	ticket={selectedTicketForDetail}
	onSubmitToCashier={handleSubmitToCashier}
/>

<TicketOrderCancelDialog
	bind:isOpen={isCancelOpen}
	ticket={selectedTicketForCancel}
	onConfirm={handleCancelTicket}
/>
