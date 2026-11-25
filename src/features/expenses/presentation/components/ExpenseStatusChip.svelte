<script lang="ts">
	import type { Component } from 'svelte';
	import type { ExpenseStatus } from '../../domain/expense.entity';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconClock from '~icons/lucide/clock';
	import IconBan from '~icons/lucide/ban';

	interface Props {
		status: ExpenseStatus;
		onCancelClick?: () => void;
		class?: string;
	}

	let { status, onCancelClick, class: className = '' }: Props = $props();

	interface StatusChipConfig {
		label: string;
		badgeClass: string;
		iconClass: string;
		icon: Component<{ class?: string }>;
	}

	const STATUS_CHIP_MAP: Record<ExpenseStatus, StatusChipConfig> = {
		APPROVED: {
			label: 'Disetujui',
			badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
			iconClass: 'text-emerald-600 dark:text-emerald-400',
			icon: IconCheckCircle2
		},
		PENDING: {
			label: 'Menunggu',
			badgeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
			iconClass: 'text-amber-600 dark:text-amber-400',
			icon: IconClock
		},
		CANCELLED: {
			label: 'Dibatalkan',
			badgeClass: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
			iconClass: 'text-rose-600 dark:text-rose-400',
			icon: IconBan
		}
	};

	const config = $derived(STATUS_CHIP_MAP[status]);
	const Icon = $derived(config.icon);
</script>

{#if status === 'CANCELLED' && onCancelClick}
	<button
		type="button"
		onclick={onCancelClick}
		title="Klik untuk melihat detail pembatalan"
		class="focus-visible:ring-focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-500/40 hover:bg-rose-500/20 focus-visible:ring-2 focus-visible:outline-hidden dark:text-rose-300 {className}"
	>
		<Icon class="size-3 {config.iconClass}" />
		<span>{config.label}</span>
	</button>
{:else}
	<span
		class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold {config.badgeClass} {className}"
	>
		<Icon class="size-3 {config.iconClass}" />
		<span>{config.label}</span>
	</span>
{/if}
