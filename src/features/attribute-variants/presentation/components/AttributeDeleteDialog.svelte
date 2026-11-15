<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import type { ProductAttribute } from '../../domain/attribute-variant.entity';

	interface Props {
		open: boolean;
		attribute: ProductAttribute | null;
		onConfirm: () => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), attribute, onConfirm, onClose }: Props = $props();
	let isDeleting = $state(false);

	async function handleDelete() {
		if (!attribute) return;
		isDeleting = true;
		const success = await onConfirm();
		isDeleting = false;
		if (success) {
			onClose();
		}
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
						Hapus Atribut Produk
					</Typography>
					<Typography
						variant="muted"
						as="p"
						class="mt-2 text-xs leading-relaxed text-foreground-subtle"
					>
						Apakah Anda yakin ingin menghapus atribut <strong class="text-foreground"
							>"{attribute.name}"</strong
						>?
					</Typography>
					{#if attribute.variants.length > 0}
						<div
							class="mt-3 rounded-lg border border-warning/20 bg-warning/10 p-3 text-xs text-warning"
						>
							Peringatan: Atribut ini memiliki <strong>{attribute.variants.length} varian</strong> yang
							juga akan ikut terhapus.
						</div>
					{/if}
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
					disabled={isDeleting}
				>
					Hapus Atribut
				</Button>
			</div>
		</div>
	</div>
{/if}
