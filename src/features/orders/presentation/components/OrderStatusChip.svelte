<script lang="ts">
	import type { Component } from 'svelte';
	import type { OrderFulfillmentStatus, OrderPaymentStatus } from '../../domain/order.entity';
	import IconFileText from '~icons/lucide/file-text';
	import IconClock from '~icons/lucide/clock';
	import IconPrinter from '~icons/lucide/printer';
	import IconPackage from '~icons/lucide/package';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconBan from '~icons/lucide/ban';
	import IconInfo from '~icons/lucide/info';
	import IconChevronDown from '~icons/lucide/chevron-down';

	interface Props {
		fulfillmentStatus: OrderFulfillmentStatus;
		paymentStatus?: OrderPaymentStatus;
		showChevron?: boolean;
		open?: boolean;
		pickedUpBy?: string | null;
		onCancelClick?: () => void;
		class?: string;
	}

	let {
		fulfillmentStatus,
		paymentStatus,
		showChevron = false,
		open = false,
		pickedUpBy = null,
		onCancelClick,
		class: className = ''
	}: Props = $props();

	interface FulfillmentChipConfig {
		label: string;
		badgeClass: string;
		hoverClass: string;
		iconClass: string;
		chevronClass: string;
		icon: Component<{ class?: string }>;
	}

	const FULFILLMENT_CHIP_MAP: Record<OrderFulfillmentStatus, FulfillmentChipConfig> = {
		CREATED: {
			label: 'Pesanan Dibuat',
			badgeClass: 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300',
			hoverClass: 'hover:border-slate-500/40',
			iconClass: 'text-slate-500 dark:text-slate-400',
			chevronClass: 'text-slate-500/70',
			icon: IconFileText
		},
		QUEUED: {
			label: 'Antrean Produksi',
			badgeClass: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
			hoverClass: 'hover:border-sky-500/40',
			iconClass: 'text-sky-600 dark:text-sky-400',
			chevronClass: 'text-sky-500/70',
			icon: IconClock
		},
		PROCESSING: {
			label: 'Di Proses',
			badgeClass: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
			hoverClass: 'hover:border-indigo-500/40',
			iconClass: 'text-indigo-600 dark:text-indigo-400',
			chevronClass: 'text-indigo-500/70',
			icon: IconPrinter
		},
		READY_FOR_PICKUP: {
			label: 'Siap Diambil',
			badgeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
			hoverClass: 'hover:border-amber-500/40',
			iconClass: 'text-amber-600 dark:text-amber-400',
			chevronClass: 'text-amber-500/70',
			icon: IconPackage
		},
		PICKED_UP: {
			label: 'Sudah Diambil',
			badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
			hoverClass: 'hover:border-emerald-500/40',
			iconClass: 'text-emerald-600 dark:text-emerald-400',
			chevronClass: 'text-emerald-500/70',
			icon: IconCheckCircle2
		}
	};

	const isCancelled = $derived(paymentStatus === 'CANCELLED' || paymentStatus === 'REFUND');
	const fulfillmentConfig = $derived(FULFILLMENT_CHIP_MAP[fulfillmentStatus]);
	const pickupTooltip = $derived(
		fulfillmentStatus === 'PICKED_UP' && pickedUpBy && !showChevron
			? `Diserahkan oleh: ${pickedUpBy}`
			: undefined
	);
</script>

{#if isCancelled}
	{#if onCancelClick}
		<button
			type="button"
			onclick={onCancelClick}
			title="Klik untuk melihat detail pembatalan"
			class="focus-visible:ring-focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-500/40 hover:bg-rose-500/20 focus-visible:ring-2 focus-visible:outline-hidden dark:text-rose-300 {className}"
		>
			<IconBan class="size-3 text-rose-600 dark:text-rose-400" />
			<span>Dibatalkan</span>
			<IconInfo class="size-3 text-rose-600/80 dark:text-rose-400/80" />
		</button>
	{:else}
		<span
			class="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 {className}"
		>
			<IconBan class="size-3 text-rose-600 dark:text-rose-400" />
			<span>Dibatalkan</span>
		</span>
	{/if}
{:else if fulfillmentConfig}
	{@const Icon = fulfillmentConfig.icon}
	<span
		title={pickupTooltip}
		class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors {fulfillmentConfig.badgeClass} {showChevron
			? fulfillmentConfig.hoverClass
			: ''} {className}"
	>
		<Icon class="size-3 {fulfillmentConfig.iconClass}" />
		<span>{fulfillmentConfig.label}</span>
		{#if showChevron}
			<IconChevronDown
				class="size-2.5 transition-transform {fulfillmentConfig.chevronClass} {open
					? 'rotate-180'
					: ''}"
			/>
		{/if}
	</span>
{:else}
	<span
		class="bg-muted/40 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground-subtle {className}"
	>
		<span>{fulfillmentStatus}</span>
	</span>
{/if}
