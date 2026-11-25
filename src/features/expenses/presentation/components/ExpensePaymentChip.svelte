<script lang="ts">
	import type { Component } from 'svelte';
	import type { ExpensePaymentStatus } from '../../domain/expense.entity';
	import IconCheckCircle2 from '~icons/lucide/check-circle-2';
	import IconCreditCard from '~icons/lucide/credit-card';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconBan from '~icons/lucide/ban';

	interface Props {
		status: ExpensePaymentStatus;
		class?: string;
	}

	let { status, class: className = '' }: Props = $props();

	interface PaymentChipConfig {
		label: string;
		badgeClass: string;
		iconClass: string;
		icon: Component<{ class?: string }>;
	}

	const PAYMENT_CHIP_MAP: Record<ExpensePaymentStatus, PaymentChipConfig> = {
		LUNAS: {
			label: 'Lunas',
			badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
			iconClass: 'text-emerald-600 dark:text-emerald-400',
			icon: IconCheckCircle2
		},
		PARTIAL_PAID: {
			label: 'Bayar Sebagian',
			badgeClass: 'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300',
			iconClass: 'text-orange-600 dark:text-orange-400',
			icon: IconCreditCard
		},
		UNPAID: {
			label: 'Hutang',
			badgeClass: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
			iconClass: 'text-rose-600 dark:text-rose-400',
			icon: IconAlertCircle
		},
		CANCELLED: {
			label: 'Dibatalkan',
			badgeClass: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
			iconClass: 'text-zinc-500 dark:text-zinc-400',
			icon: IconBan
		}
	};

	const config = $derived(PAYMENT_CHIP_MAP[status]);
	const Icon = $derived(config.icon);
</script>

<span
	class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold {config.badgeClass} {className}"
>
	<Icon class="size-3 {config.iconClass}" />
	<span>{config.label}</span>
</span>
