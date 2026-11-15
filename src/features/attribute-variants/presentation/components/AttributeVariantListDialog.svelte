<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import IconX from '~icons/lucide/x';
	import IconEdit2 from '~icons/lucide/edit-2';
	import IconSlidersHorizontal from '~icons/lucide/sliders-horizontal';
	import IconSearch from '~icons/lucide/search';
	import type { ProductAttribute } from '../../domain/attribute-variant.entity';

	interface Props {
		open: boolean;
		attribute: ProductAttribute | null;
		onClose: () => void;
		onEdit?: (attribute: ProductAttribute) => void;
	}

	let { open = $bindable(false), attribute, onClose, onEdit }: Props = $props();

	let searchQuery = $state('');

	function modalSlideIn(node: Element, { duration = 280 }: { duration?: number }) {
		return {
			duration,
			css: (t: number) => {
				const eased = cubicOut(t);
				return `
					transform: scale(${0.96 + 0.04 * eased}) translateY(${(1 - eased) * 10}px);
					opacity: ${eased};
				`;
			}
		};
	}

	const sortedVariants = $derived.by(() => {
		if (!attribute?.variants) return [];
		return [...attribute.variants].sort((a, b) => a.displayOrder - b.displayOrder);
	});

	const filteredVariants = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return sortedVariants;
		return sortedVariants.filter((v) => v.name.toLowerCase().includes(query));
	});

	$effect(() => {
		if (!open) {
			searchQuery = '';
		}
	});

	function handleEdit() {
		if (!attribute) return;
		const target = attribute;
		onClose();
		onEdit?.(target);
	}
</script>

{#if open && attribute}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/50 backdrop-blur-sm"
			transition:fade={{ duration: 220 }}
			onclick={onClose}
			aria-label="Tutup modal"
		></button>

		<!-- Dialog Modal Container -->
		<div
			class="relative z-10 w-full max-w-md rounded-xl border border-border bg-app-surface p-6 shadow-xl"
			transition:modalSlideIn={{ duration: 280 }}
		>
			<!-- Header -->
			<div class="flex items-start justify-between border-b border-border pb-4">
				<div class="flex items-start gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
					>
						<IconSlidersHorizontal class="size-5" />
					</div>
					<div>
						<Typography variant="h3" as="h2" class="font-bold text-foreground">
							{attribute.name}
						</Typography>
						<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle">
							Kode: <code class="font-semibold text-foreground">{attribute.code}</code> • Total {sortedVariants.length} opsi nilai
						</Typography>
					</div>
				</div>

				<button
					type="button"
					class="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
					onclick={onClose}
					aria-label="Tutup"
				>
					<IconX class="size-5" />
				</button>
			</div>

			<!-- Search Filter (if variants > 5) -->
			{#if sortedVariants.length > 5}
				<div class="relative mt-4">
					<TextField
						size="sm"
						placeholder="Cari opsi varian..."
						bind:value={searchQuery}
						class="w-full pl-8"
						classes={{ container: 'rounded-md', input: 'text-xs' }}
					/>
					<div
						class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground-subtle"
					>
						<IconSearch class="size-3.5" />
					</div>
				</div>
			{/if}

			<!-- Variant List -->
			<div class="mt-4">
				<div class="mb-2 flex items-center justify-between text-[11px] font-semibold text-foreground-subtle">
					<span>DAFTAR OPSI & URUTAN KASIR</span>
					<span>{filteredVariants.length} dari {sortedVariants.length}</span>
				</div>

				{#if filteredVariants.length === 0}
					<div class="rounded-md border border-border bg-surface-subtle/50 py-8 text-center text-xs text-foreground-subtle">
						Tidak ada varian yang cocok dengan "{searchQuery}".
					</div>
				{:else}
					<div class="flex max-h-72 flex-col gap-1.5 overflow-y-auto rounded-md border border-border bg-surface-subtle/50 p-2">
						{#each filteredVariants as v (v.id)}
							<div
								class="flex select-none items-center justify-between rounded-md border border-primary/20 bg-primary/[0.04] px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.08] dark:bg-primary/[0.08] dark:hover:bg-primary/[0.12]"
							>
								<div class="flex min-w-0 flex-1 items-center gap-2.5">
									<!-- Order Index Badge -->
									<span
										class="flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-primary/15 px-1 text-[11px] font-semibold text-primary dark:bg-primary/25"
									>
										{String(v.displayOrder).padStart(2, '0')}
									</span>

									<!-- Variant Name -->
									<span class="truncate font-medium text-foreground">{v.name}</span>
								</div>

								<!-- Order Position Label -->
								<span class="text-[10px] text-foreground-subtle">
									Opsi #{v.displayOrder}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="mt-6 flex items-center justify-between border-t border-border pt-4">
				<Button type="button" variant="ghost" size="sm" onclick={onClose}>
					Tutup
				</Button>

				{#if onEdit}
					<Button type="button" variant="default" size="sm" onclick={handleEdit} class="gap-1.5">
						<IconEdit2 class="size-3.5" />
						<span>Edit Atribut & Varian</span>
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}
