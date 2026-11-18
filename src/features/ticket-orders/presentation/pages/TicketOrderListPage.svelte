<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
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

	import IconTicket from '~icons/lucide/ticket';
	import IconCirclePlus from '~icons/lucide/circle-plus';
	import IconSearch from '~icons/lucide/search';
	import IconRefreshCw from '~icons/lucide/refresh-cw';
	import IconEye from '~icons/lucide/eye';
	import IconSend from '~icons/lucide/send';
	import IconBan from '~icons/lucide/ban';
	import IconClock from '~icons/lucide/clock';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconEllipsisVertical from '~icons/lucide/ellipsis-vertical';

	import type { TicketOrder } from '../../domain/ticket-order.entity';
	import { getStatusBadgeVariant, getStatusLabel } from '../../domain/ticket-order.entity';
	import { ticketOrderStore } from '../../application/ticket-order.store.svelte';
	import TicketOrderDetailDialog from '../components/TicketOrderDetailDialog.svelte';
	import TicketOrderCancelDialog from '../components/TicketOrderCancelDialog.svelte';

	onMount(() => {
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
				Antrean tiket kerja teknis desainer, spesifikasi cetak, dan pengiriman ke kasir untuk
				penerbitan nota & SPK.
			</Typography>
		</div>
	</div>

	<!-- Content Section: Toolbar, Filter Tabs, Table, Pagination -->
	<div class="flex flex-col gap-3">
		<!-- Action & Search Toolbar -->
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<!-- Search & Status Tabs -->
			<div class="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
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

				<!-- Status Filter Tabs -->
				<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
					<button
						type="button"
						onclick={() => {
							ticketOrderStore.statusTab = 'all';
							ticketOrderStore.page = 1;
							ticketOrderStore.load();
						}}
						class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {ticketOrderStore.statusTab ===
						'all'
							? 'bg-primary text-primary-foreground shadow-2xs'
							: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:bg-surface-subtle/80 hover:text-foreground'}"
					>
						Semua ({ticketOrderStore.stats.total})
					</button>

					<button
						type="button"
						onclick={() => {
							ticketOrderStore.statusTab = 'pending';
							ticketOrderStore.page = 1;
							ticketOrderStore.load();
						}}
						class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {ticketOrderStore.statusTab ===
						'pending'
							? 'bg-primary text-primary-foreground shadow-2xs'
							: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:bg-surface-subtle/80 hover:text-foreground'}"
					>
						Draft Desainer ({ticketOrderStore.stats.pendingDraft})
					</button>

					<button
						type="button"
						onclick={() => {
							ticketOrderStore.statusTab = 'submitted';
							ticketOrderStore.page = 1;
							ticketOrderStore.load();
						}}
						class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {ticketOrderStore.statusTab ===
						'submitted'
							? 'bg-primary text-primary-foreground shadow-2xs'
							: 'border border-border/70 bg-surface-subtle text-foreground-subtle hover:bg-surface-subtle/80 hover:text-foreground'}"
					>
						Dikirim ke Kasir ({ticketOrderStore.stats.submitted})
					</button>
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
						<a {...props} href={resolve('/(app)/transactions/new')}>
							<IconCirclePlus class="size-4" />
							<span>Buat Tiket Baru</span>
						</a>
					{/snippet}
				</Button>
			</div>
		</div>

		<!-- Table Container -->
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
							<span class="text-sm font-semibold text-foreground">
								Tidak ada tiket pesanan ditemukan
							</span>
						{/snippet}
						{#snippet description()}
							<span class="text-xs text-foreground-subtle">
								{ticketOrderStore.searchQuery || ticketOrderStore.statusTab !== 'all'
									? 'Sesuaikan kata kunci pencarian atau tab filter status Anda.'
									: 'Belum ada antrean tiket pesanan yang dibuat oleh desainer.'}
							</span>
						{/snippet}
					</EmptyState>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead class="w-12 text-center">No</TableHead>
								<TableHead>Nomor Tiket & Waktu</TableHead>
								<TableHead>Pelanggan</TableHead>
								<TableHead>Rincian Item Spesifikasi</TableHead>
								<TableHead>Target Deadline</TableHead>
								<TableHead>Status Tiket</TableHead>
								<TableHead class="w-20 text-center">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each ticketOrderStore.items as ticket, index (ticket.id)}
								<TableRow class="hover:bg-surface-subtle/50">
									<!-- Number -->
									<TableCell class="text-center text-xs text-foreground-subtle">
										{(ticketOrderStore.page - 1) * ticketOrderStore.limit + index + 1}
									</TableCell>

									<!-- Job Number & Date -->
									<TableCell>
										<div class="flex flex-col">
											<span class="font-semibold text-primary">{ticket.jobNumber}</span>
											<span class="text-[11px] text-foreground-subtle">
												{new Date(ticket.createdAt).toLocaleDateString('id-ID', {
													day: 'numeric',
													month: 'short',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</span>
										</div>
									</TableCell>

									<!-- Customer -->
									<TableCell>
										<div class="flex flex-col gap-0.5">
											<div class="flex items-center gap-1.5 font-medium text-foreground">
												<span>{ticket.customerName}</span>
												{#if ticket.customerType === 'reseller'}
													<Badge variant="outline" size="sm">Reseller</Badge>
												{/if}
											</div>
											<span class="text-[11px] text-foreground-subtle">
												{ticket.customerPhone}
											</span>
										</div>
									</TableCell>

									<!-- Items summary -->
									<TableCell>
										<div class="flex flex-col gap-0.5">
											{#if ticket.items.length > 0}
												<span class="font-medium text-foreground">
													{ticket.items[0].productName}
													{#if ticket.items.length > 1}
														<span class="text-foreground-subtle font-normal">
															(+{ticket.items.length - 1} item lain)
														</span>
													{/if}
												</span>
												<span class="text-[11px] text-foreground-subtle">
													{ticket.items[0].dimensionText} • Qty {ticket.items[0].quantity}
													{#if ticket.totalAreaM2 > 0}
														• ({ticket.totalAreaM2.toFixed(2)} m²)
													{/if}
												</span>
											{:else}
												<span class="text-foreground-faint">-</span>
											{/if}
										</div>
									</TableCell>

									<!-- Deadline -->
									<TableCell class="text-xs text-foreground-subtle">
										{#if ticket.deadline}
											<div class="flex items-center gap-1">
												<IconClock class="size-3 text-foreground-faint" />
												<span>
													{new Date(ticket.deadline).toLocaleDateString('id-ID', {
														day: 'numeric',
														month: 'short',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</span>
											</div>
										{:else}
											<span class="text-foreground-faint">Normal</span>
										{/if}
									</TableCell>

									<!-- Status -->
									<TableCell>
										<Badge variant={getStatusBadgeVariant(ticket.status)} size="sm">
											{getStatusLabel(ticket.status)}
										</Badge>
									</TableCell>

									<!-- Action Menu -->
									<TableCell class="text-center">
										<Dropdown
											placement="bottom-end"
											offset={4}
											aria-label="Aksi Tiket Pesanan"
											class="size-8 justify-center! rounded-lg border border-transparent p-0! text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
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
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>

				<!-- Pagination -->
				<div class="border-t border-border/70 p-3">
					<TablePagination
						currentPage={ticketOrderStore.page}
						pageSize={ticketOrderStore.limit}
						totalItems={ticketOrderStore.totalData}
						onPageChange={(p) => {
							ticketOrderStore.page = p;
							ticketOrderStore.load();
						}}
					/>
				</div>
			{/if}
		</Card>
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
