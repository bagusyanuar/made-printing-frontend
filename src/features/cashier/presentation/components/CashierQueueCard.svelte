<script lang="ts">
	import type { CashierOrder } from '../../domain/cashier.entity';
	import {
		formatCashierItemsSummary,
		formatCurrency,
		formatCashierDateTime
	} from '../../domain/cashier.entity';
	import IconShoppingBag from '~icons/lucide/shopping-bag';
	import IconChevronRight from '~icons/lucide/chevron-right';
	import IconPalette from '~icons/lucide/palette';
	import IconClock from '~icons/lucide/clock';
	import IconHandshake from '~icons/lucide/handshake';

	interface Props {
		order: CashierOrder;
		isSelected: boolean;
		onSelect: (orderId: string) => void;
	}

	let { order, isSelected, onSelect }: Props = $props();

	let itemsSummary = $derived(formatCashierItemsSummary(order.items));
</script>

<div
	role="button"
	tabindex="0"
	onclick={() => onSelect(order.id)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(order.id);
		}
	}}
	class="group relative flex cursor-pointer flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-150 {isSelected
		? order.orderType === 'RETAIL'
			? 'border-orange-500/50 bg-orange-500/4'
			: 'border-red-500/50 bg-red-500/4'
		: 'bg-card hover:bg-muted/30 border-border hover:border-border'}"
>
	<!-- Left Accent Indicator on Selected -->
	{#if isSelected}
		<div
			class="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-r {order.orderType === 'RETAIL'
				? 'bg-orange-500'
				: 'bg-red-600'}"
		></div>
	{/if}

	<!-- Top Row: Customer & Order Value -->
	<div class="flex items-center justify-between gap-2 pl-1">
		<div class="flex min-w-0 items-center gap-2">
			<span class="truncate text-sm font-bold text-foreground">
				{order.customerName}
			</span>
			{#if order.customerType === 'reseller'}
				<span
					title="Pelanggan Reseller"
					aria-label="Reseller"
					class="flex size-5 shrink-0 items-center justify-center rounded-md border border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
				>
					<IconHandshake class="size-3.5" />
				</span>
			{/if}
		</div>

		<!-- Total Tagihan di Kartu -->
		<span class="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400">
			{formatCurrency(order.subtotal)}
		</span>
	</div>

	<!-- Meta Row: Job Number, Designer & Time -->
	<div class="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-xs text-foreground-subtle">
		<span class="bg-muted/80 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-foreground/90">
			{order.jobNumber}
		</span>

		{#if order.designerName}
			<span class="text-border">•</span>
			<div class="flex items-center gap-1 text-[11px] text-foreground-subtle">
				<IconPalette class="size-3 shrink-0 text-amber-500/90" />
				<span class="text-foreground/90">{order.designerName}</span>
			</div>
		{/if}

		<span class="text-border">•</span>
		<div class="flex items-center gap-1 text-[11px] text-foreground-subtle">
			<IconClock class="size-3 shrink-0 text-foreground-subtle" />
			<span>{formatCashierDateTime(order.createdAt)}</span>
		</div>
	</div>

	<!-- Bottom Row: Multi-item summary -->
	<div
		class="bg-muted/30 flex items-center justify-between gap-2 rounded-md border border-border/50 px-2.5 py-1.5 pl-2 text-xs text-foreground-subtle"
	>
		<div class="flex min-w-0 items-center gap-1.5">
			<IconShoppingBag class="size-3.5 shrink-0 text-foreground-subtle" />
			<span class="truncate text-[11px] font-medium text-foreground-subtle">
				{itemsSummary}
			</span>
		</div>

		<div
			class="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold transition-colors {isSelected
				? order.orderType === 'RETAIL'
					? 'text-orange-600 dark:text-orange-400'
					: 'text-red-600 dark:text-red-400'
				: 'text-foreground-subtle group-hover:text-foreground'}"
		>
			<span>Buka</span>
			<IconChevronRight class="size-3" />
		</div>
	</div>
</div>
