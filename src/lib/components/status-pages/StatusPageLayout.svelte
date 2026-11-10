<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { Component, Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconArrowLeft from '~icons/lucide/arrow-left';
	import IconHouse from '~icons/lucide/house';

	interface ActionConfig {
		label: string;
		href?: string;
		onClick?: () => void;
	}

	interface Props {
		/** Label kode status (contoh: "404", "403", "500", atau "SEGERA HADIR") */
		badgeText?: string;
		/** Class styling untuk badge */
		badgeClass?: string;
		/** Komponen Icon Lucide */
		icon: Component<{ class?: string }>;
		/** Class CSS pembungkus icon (warna background & teks icon) */
		iconWrapperClass?: string;
		/** Judul utama status halaman */
		title: string;
		/** Deskripsi atau penjelasan ramah pengguna */
		description: string;
		/** Konfigurasi tombol aksi utama (default: Kembali ke Dashboard) */
		primaryAction?: ActionConfig;
		/** Konfigurasi tombol aksi kedua (default: Halaman Sebelumnya) */
		secondaryAction?: ActionConfig;
		/** Tampilkan tombol default "Halaman Sebelumnya" */
		showBackButton?: boolean;
		/** Snippet konten tambahan (misal: stack trace error / detail teknis) */
		children?: Snippet;
	}

	let {
		badgeText,
		badgeClass = 'bg-surface-subtle text-foreground-subtle border-border',
		icon: IconComponent,
		iconWrapperClass = 'bg-primary/10 text-primary border-primary/20',
		title,
		description,
		primaryAction = {
			label: 'Kembali ke Dashboard',
			href: resolve('/(app)/dashboard')
		},
		secondaryAction,
		showBackButton = true,
		children
	}: Props = $props();

	function handleBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			window.location.href = resolve('/(app)/dashboard');
		}
	}
</script>

<div class="flex min-h-[65vh] w-full items-center justify-center p-4 sm:p-6">
	<div
		class="relative flex w-full max-w-lg flex-col items-center rounded-2xl border border-border bg-app-surface p-8 text-center shadow-xs sm:p-10"
	>
		<!-- Icon Container -->
		<div
			class="flex size-16 shrink-0 items-center justify-center rounded-2xl border shadow-2xs {iconWrapperClass}"
		>
			<IconComponent class="size-8" />
		</div>

		<!-- Optional Badge -->
		{#if badgeText}
			<div class="mt-5">
				<span
					class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium {badgeClass}"
				>
					{badgeText}
				</span>
			</div>
		{/if}

		<!-- Title & Description -->
		<div class="mt-4 flex flex-col gap-2">
			<Typography
				variant="h2"
				as="h1"
				class="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
			>
				{title}
			</Typography>
			<Typography
				variant="muted"
				as="p"
				class="mx-auto max-w-md text-xs leading-relaxed text-foreground-subtle sm:text-sm"
			>
				{description}
			</Typography>
		</div>

		<!-- Extra Content (Collapsible details, etc.) -->
		{#if children}
			<div class="mt-6 w-full text-left">
				{@render children()}
			</div>
		{/if}

		<!-- Actions Toolbar -->
		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			{#if showBackButton}
				<Button variant="outline" size="sm" onclick={handleBack} class="gap-1.5">
					<IconArrowLeft class="size-4" />
					<span>Kembali</span>
				</Button>
			{/if}

			{#if secondaryAction}
				{#if secondaryAction.href}
					<Button variant="outline" size="sm">
						{#snippet child({ props })}
							<a href={secondaryAction.href} {...props}>
								<span>{secondaryAction.label}</span>
							</a>
						{/snippet}
					</Button>
				{:else if secondaryAction.onClick}
					<Button variant="outline" size="sm" onclick={secondaryAction.onClick}>
						{secondaryAction.label}
					</Button>
				{/if}
			{/if}

			{#if primaryAction}
				{#if primaryAction.href}
					<Button variant="default" size="sm" class="gap-1.5">
						{#snippet child({ props })}
							<a href={primaryAction.href} {...props}>
								<IconHouse class="size-4" />
								<span>{primaryAction.label}</span>
							</a>
						{/snippet}
					</Button>
				{:else if primaryAction.onClick}
					<Button variant="default" size="sm" onclick={primaryAction.onClick} class="gap-1.5">
						<IconHouse class="size-4" />
						<span>{primaryAction.label}</span>
					</Button>
				{/if}
			{/if}
		</div>
	</div>
</div>
