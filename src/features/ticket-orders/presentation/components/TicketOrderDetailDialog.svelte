<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import IconTicket from '~icons/lucide/ticket';
	import IconCalendar from '~icons/lucide/calendar';
	import IconSend from '~icons/lucide/send';
	import IconExternalLink from '~icons/lucide/external-link';
	import IconX from '~icons/lucide/x';
	import type { TicketOrder } from '../../domain/ticket-order.entity';
	import { getStatusBadgeVariant, getStatusLabel } from '../../domain/ticket-order.entity';

	let {
		isOpen = $bindable(false),
		ticket = null,
		onSubmitToCashier
	}: {
		isOpen: boolean;
		ticket: TicketOrder | null;
		onSubmitToCashier?: (id: string) => Promise<boolean>;
	} = $props();

	let isSubmitting = $state(false);

	async function handleSubmit() {
		if (!ticket || !onSubmitToCashier) return;
		isSubmitting = true;
		const success = await onSubmitToCashier(ticket.id);
		isSubmitting = false;
		if (success) {
			isOpen = false;
		}
	}
</script>

{#if isOpen && ticket}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
			onclick={() => (isOpen = false)}
			aria-label="Tutup dialog"
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-app-surface p-5 shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-start justify-between border-b border-border/70 pb-3">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
					>
						<IconTicket class="size-5" />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<Typography variant="h4" as="h2" class="font-bold text-foreground">
								{ticket.jobNumber}
							</Typography>
							<Badge variant={getStatusBadgeVariant(ticket.status)} size="sm">
								{getStatusLabel(ticket.status)}
							</Badge>
						</div>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							Dibuat oleh {ticket.designerName} • {new Date(ticket.createdAt).toLocaleString(
								'id-ID'
							)}
						</Typography>
					</div>
				</div>

				<button
					type="button"
					onclick={() => (isOpen = false)}
					class="cursor-pointer rounded-lg p-1 text-foreground-subtle hover:bg-surface-subtle hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Customer & Order Meta -->
			<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg bg-surface-subtle p-3 text-xs">
				<div>
					<span class="block text-foreground-subtle">Pelanggan:</span>
					<div class="mt-0.5 flex items-center gap-1.5 font-medium text-foreground">
						<span>{ticket.customerName}</span>
						{#if ticket.customerType === 'reseller'}
							<Badge variant="outline" size="sm">Reseller</Badge>
						{:else}
							<Badge variant="secondary" size="sm">Retail</Badge>
						{/if}
					</div>
					<span class="text-[11px] text-foreground-faint">WA: {ticket.customerPhone}</span>
				</div>
				<div>
					<span class="block text-foreground-subtle">Target Deadline:</span>
					<div class="mt-0.5 flex items-center gap-1.5 font-medium text-foreground">
						<IconCalendar class="size-3.5 text-primary" />
						<span>
							{ticket.deadline
								? new Date(ticket.deadline).toLocaleString('id-ID')
								: 'Tidak ditentukan (Normal)'}
						</span>
					</div>
					{#if ticket.notes}
						<span class="mt-1 block text-[11px] text-foreground-subtle">
							Memo: {ticket.notes}
						</span>
					{/if}
				</div>
			</div>

			<!-- Technical Specifications Table (Zero Price Display) -->
			<div class="mt-4">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-xs font-semibold text-foreground">
						Rincian Item Teknis ({ticket.items.length} Item)
					</span>
					{#if ticket.totalAreaM2 > 0}
						<span class="text-xs text-foreground-subtle">
							Total Luas: <strong class="text-foreground">{ticket.totalAreaM2.toFixed(2)} m²</strong>
						</span>
					{/if}
				</div>

				<div class="overflow-x-auto rounded-lg border border-border/70">
					<table class="w-full text-left text-xs">
						<thead class="border-b border-border/70 bg-surface-subtle text-foreground-subtle">
							<tr>
								<th class="px-3 py-2 font-medium">No</th>
								<th class="px-3 py-2 font-medium">Nama Produk & Varian</th>
								<th class="px-3 py-2 font-medium">Dimensi / Satuan</th>
								<th class="px-3 py-2 font-medium">Qty</th>
								<th class="px-3 py-2 font-medium">Catatan Produksi & File</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border/70 text-foreground">
							{#each ticket.items as item, index (item.id || index)}
								<tr class="hover:bg-surface-subtle/50">
									<td class="px-3 py-2.5 text-foreground-subtle">{index + 1}</td>
									<td class="px-3 py-2.5 font-medium">
										<div>{item.productName}</div>
										{#if item.variantName}
											<div class="text-[11px] text-foreground-subtle">{item.variantName}</div>
										{/if}
									</td>
									<td class="px-3 py-2.5 text-foreground-subtle">
										{item.dimensionText}
									</td>
									<td class="px-3 py-2.5 font-semibold text-primary">
										{item.quantity}
									</td>
									<td class="px-3 py-2.5">
										<div class="text-foreground-subtle">
											{item.productionNotes || '-'}
										</div>
										{#if item.designFileUrl}
											<a
												href={item.designFileUrl}
												target="_blank"
												rel="external noopener noreferrer"
												class="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
											>
												<IconExternalLink class="size-3" />
												Lihat File Desain
											</a>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="mt-5 flex items-center justify-between border-t border-border/70 pt-3">
				<Button variant="outline" size="sm" onclick={() => (isOpen = false)}>Tutup</Button>
				{#if ticket.status === 'DRAFT' && onSubmitToCashier}
					<Button
						variant="default"
						size="sm"
						onclick={handleSubmit}
						disabled={isSubmitting}
						class="gap-1.5"
					>
						<IconSend class="size-3.5" />
						<span>{isSubmitting ? 'Mengirim...' : 'Kirim ke Kasir'}</span>
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}
