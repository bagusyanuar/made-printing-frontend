<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import type { ProductCategory } from '../../domain/product-category.entity';

	interface Props {
		open: boolean;
		category: ProductCategory | null;
		onConfirm: () => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), category, onConfirm, onClose }: Props = $props();
	let isDeleting = $state(false);

	async function handleDelete() {
		if (!category) return;
		isDeleting = true;
		const success = await onConfirm();
		isDeleting = false;
		if (success) {
			onClose();
		}
	}
</script>

{#if open && category}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog"
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 w-full max-w-md rounded-xl border border-border bg-app-surface p-6 shadow-xl"
		>
			<div class="flex items-start gap-4">
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger"
				>
					<IconAlertTriangle class="size-5" />
				</div>
				<div class="flex-1">
					<Typography variant="h3" as="h2" class="font-bold text-foreground">
						Hapus Kategori Produk
					</Typography>
					<Typography
						variant="muted"
						as="p"
						class="mt-2 text-xs leading-relaxed text-foreground-subtle"
					>
						Apakah Anda yakin ingin menghapus kategori <strong>{category.name}</strong>
						({category.code})? Tindakan ini tidak dapat dibatalkan.
					</Typography>
				</div>
			</div>

			<div class="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
				<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isDeleting}>
					Batal
				</Button>
				<Button
					type="button"
					variant="default"
					size="sm"
					class="bg-danger text-white hover:bg-danger/90"
					onclick={handleDelete}
					isLoading={isDeleting}
				>
					Hapus Kategori
				</Button>
			</div>
		</div>
	</div>
{/if}
