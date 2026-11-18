<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconAlertTriangle from '~icons/lucide/alert-triangle';
	import IconX from '~icons/lucide/x';
	import type { ExpenseCategory } from '../../domain/expense-category.entity';

	interface Props {
		open: boolean;
		category: ExpenseCategory | null;
		onConfirm: () => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), category, onConfirm, onClose }: Props = $props();

	let isDeleting = $state(false);

	async function handleDelete() {
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
			class="relative z-10 w-full max-w-md rounded-xl border border-border bg-app-surface p-5 shadow-2xl"
		>
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 items-center justify-center rounded-lg border border-danger/20 bg-danger/10 text-danger"
					>
						<IconAlertTriangle class="size-4.5" />
					</div>
					<div>
						<Typography variant="h4" as="h3" class="text-sm font-semibold text-foreground">
							Hapus Kategori Pengeluaran
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							Konfirmasi penghapusan master data
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="flex size-7 items-center justify-center rounded-lg text-foreground-subtle hover:bg-surface-subtle hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<div class="mt-3.5 text-xs leading-relaxed text-foreground-subtle">
				Apakah Anda yakin ingin menghapus kategori pengeluaran
				<strong class="font-semibold text-foreground">"{category.name}"</strong>? Data yang dihapus
				tidak dapat dikembalikan dan tidak akan muncul di form pengeluaran baru.
			</div>

			<div class="mt-5 flex items-center justify-end gap-2 border-t border-border pt-3.5">
				<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isDeleting}>
					Batal
				</Button>
				<Button
					type="button"
					variant="default"
					size="sm"
					class="bg-danger text-white hover:bg-danger/90"
					isLoading={isDeleting}
					onclick={handleDelete}
				>
					{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
				</Button>
			</div>
		</div>
	</div>
{/if}
