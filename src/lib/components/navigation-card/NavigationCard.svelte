<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { Component } from 'svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import IconArrowRight from '~icons/lucide/arrow-right';

	interface Props {
		/** Judul modul atau halaman tujuan */
		title: string;
		/** Penjelasan ringkas fungsi modul */
		description: string;
		/** URL rute navigasi */
		href: string;
		/** Ikon Lucide/Iconify */
		icon: Component<{ class?: string }>;
		/** Label badge opsional (contoh: "Aktif", "Segera Hadir", "5 Kategori") */
		badge?: string;
		/** Menonaktifkan interaksi klik */
		disabled?: boolean;
		/** Membuka tautan di tab baru jika true */
		external?: boolean;
		/** Class CSS tambahan */
		class?: string;
	}

	let {
		title,
		description,
		href,
		icon: IconComponent,
		badge,
		disabled = false,
		external = false,
		class: className = ''
	}: Props = $props();
</script>

{#if disabled}
	<div
		class="relative flex cursor-not-allowed items-start gap-4 rounded-xl border border-border bg-surface-subtle/50 p-5 opacity-60 shadow-xs {className}"
		aria-disabled="true"
	>
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-foreground-subtle"
		>
			<IconComponent class="size-5" />
		</div>

		<div class="flex flex-1 flex-col gap-1">
			<div class="flex items-center justify-between gap-2">
				<Typography variant="h3" as="h2" class="text-sm font-semibold text-foreground">
					{title}
				</Typography>
				{#if badge}
					<Badge variant="secondary" size="sm">{badge}</Badge>
				{/if}
			</div>
			<p class="text-xs leading-relaxed text-foreground-subtle">
				{description}
			</p>
		</div>
	</div>
{:else}
	<a
		{href}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
		class="group relative flex items-start gap-4 rounded-xl border border-border bg-app-surface p-5 shadow-xs transition-all duration-150 hover:border-primary/40 hover:bg-surface-hover/40 hover:shadow-sm {className}"
	>
		<div
			class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-150 group-hover:bg-primary/15"
		>
			<IconComponent class="size-5" />
		</div>

		<div class="flex flex-1 flex-col gap-1">
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2">
					<Typography
						variant="h3"
						as="h2"
						class="text-sm font-semibold text-foreground transition-colors group-hover:text-primary"
					>
						{title}
					</Typography>
					{#if badge}
						<Badge variant="secondary" size="sm">{badge}</Badge>
					{/if}
				</div>
				<IconArrowRight
					class="size-4 shrink-0 text-foreground-subtle/50 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
				/>
			</div>
			<p class="text-xs leading-relaxed text-foreground-subtle">
				{description}
			</p>
		</div>
	</a>
{/if}
